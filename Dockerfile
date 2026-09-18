# syntax=docker/dockerfile:1

FROM node:22-slim AS base

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@11.21.0
RUN pnpm config set registry https://registry.npmjs.org/

ENV HUSKY=0
ENV CI=true
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

WORKDIR /app


# ============================================================
# Dependencies
# ============================================================
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/types/package.json ./packages/types/package.json

RUN --mount=type=cache,id=linkforge-pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter=api...


# ============================================================
# Builder
# ============================================================
FROM deps AS builder

COPY apps/api/prisma ./apps/api/prisma

RUN pnpm --filter=api exec prisma generate

COPY packages/types ./packages/types
COPY apps/api/src ./apps/api/src
COPY apps/api/main.ts ./apps/api/main.ts
COPY apps/api/instrument.ts ./apps/api/instrument.ts
COPY apps/api/server.ts ./apps/api/server.ts
COPY apps/api/tsconfig.json ./apps/api/tsconfig.json

RUN pnpm --filter=api build


# ============================================================
# Production dependencies
# ============================================================
FROM deps AS prod-deps

RUN pnpm --filter=api --prod deploy --legacy /prod/app


# ============================================================
# Runner
# ============================================================
FROM node:22-slim AS runner

WORKDIR /app

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=prod-deps --chown=node:node \
    /prod/app/node_modules ./node_modules

COPY --from=prod-deps --chown=node:node \
    /prod/app/package.json ./package.json

COPY --from=builder --chown=node:node \
    /app/apps/api/generated ./generated

COPY --from=builder --chown=node:node \
    /app/apps/api/dist ./dist

USER node

EXPOSE 5000

HEALTHCHECK \
    --interval=30s \
    --timeout=5s \
    --start-period=15s \
    --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 5000) + '/health').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

# CMD ["node", "dist/server.js"]

CMD ["node", "--import", "./dist/instrument.js", "dist/server.js"]
