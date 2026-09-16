# ==============================================================================
# Base Stage: Setup Node runtime, OpenSSL (for Prisma), and Corepack / pnpm
# ==============================================================================
FROM node:20-slim AS base

# Install OpenSSL for Prisma engine compatibility on Debian slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Enable Corepack and pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# ==============================================================================
# Builder Stage: Install full dependencies, generate Prisma client, and compile TS
# ==============================================================================
FROM base AS builder

# Copy monorepo configuration and package manifests for optimal layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/

# Install full workspace dependencies (including TypeScript and esbuild)
RUN pnpm install --frozen-lockfile

# Copy Prisma schema and generate Prisma Client
COPY apps/api/prisma ./apps/api/prisma
RUN pnpm --filter api exec prisma generate

# Copy workspace packages and API application source code
COPY packages/types ./packages/types
COPY apps/api/src ./apps/api/src
COPY apps/api/main.ts apps/api/server.ts apps/api/tsconfig.json ./apps/api/

# Compile TypeScript into self-contained ESM JavaScript bundles in apps/api/dist
RUN pnpm --filter api build

# ==============================================================================
# Prod-Deps Stage: Isolate production dependencies without dev tooling
# ==============================================================================
FROM base AS prod-deps

# Copy workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/

# Deploy isolated production workspace for apps/api
RUN pnpm --filter=api --prod deploy /prod/app

# Copy Prisma schema and generate Prisma Client in the isolated production environment
COPY apps/api/prisma /prod/app/prisma
WORKDIR /prod/app
RUN npx prisma generate

# ==============================================================================
# Runner Stage: Minimal production image
# ==============================================================================
FROM node:20-slim AS runner

WORKDIR /app

# Install OpenSSL required by Prisma engine runtime
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Copy isolated production dependencies, generated Prisma client, and compiled JS
COPY --from=prod-deps --chown=node:node /prod/app/node_modules ./node_modules
COPY --from=prod-deps --chown=node:node /prod/app/package.json ./package.json
COPY --from=prod-deps --chown=node:node /prod/app/prisma ./prisma
COPY --from=prod-deps --chown=node:node /prod/app/generated ./generated
COPY --from=builder --chown=node:node /app/apps/api/dist ./dist

# Run as non-root user (node)
USER node

# Expose API runtime port
EXPOSE 5000

# Health check using native Node 20+ fetch against the existing /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 5000) + '/health').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

# Start the API server using compiled JavaScript
CMD ["node", "dist/server.js"]
