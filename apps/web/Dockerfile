# ==============================================================================
# Base Stage: Setup Node runtime and Corepack / pnpm
# ==============================================================================
FROM node:20-slim AS base

# Enable Corepack and configure pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# ==============================================================================
# Dependencies Stage: Install workspace dependencies for Next.js build
# ==============================================================================
FROM base AS deps

# Copy monorepo configuration and package manifests for optimal layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/

# Install full workspace dependencies
RUN pnpm install --frozen-lockfile

# ==============================================================================
# Builder Stage: Build Next.js application in standalone mode
# ==============================================================================
FROM base AS builder

# Re-use installed workspace node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules

# Copy workspace packages and Web application source code
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/types ./packages/types
COPY apps/web ./apps/web

# Set production build environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js with standalone output
RUN pnpm --filter web build

# ==============================================================================
# Runner Stage: Minimal production standalone runtime
# ==============================================================================
FROM node:20-slim AS runner

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy static assets, standalone server, and traced production dependencies
COPY --from=builder --chown=node:node /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static

# Run as unprivileged non-root user (node)
USER node

# Expose Next.js port
EXPOSE 3000

# Health check using native Node 20+ fetch against the web server
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 3000) + '/').then(r => { if (!r.ok && r.status !== 307 && r.status !== 308) process.exit(1) }).catch(() => process.exit(1))"

# Start Next.js standalone server
CMD ["node", "apps/web/server.js"]
