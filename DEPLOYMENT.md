# LinkForge Production Deployment Guide

This document outlines the deployment architecture, configuration steps, and CI/CD pipelines for LinkForge.

---

## 1. System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION ARCHITECTURE                  │
├─────────────────────────────┬───────────────────────────────┤
│ Frontend (Web)              │ Vercel (Next.js 16 SSR/Edge)  │
│ Backend API                 │ Northflank (Express 5 REST)   │
│ Background Worker           │ Northflank (BullMQ Worker)    │
│ Database                    │ Neon PostgreSQL (Prisma ORM)  │
│ Cache & Queues              │ Upstash Redis (BullMQ queues) │
│ Email Service               │ Resend                        │
│ Observability               │ OpenTelemetry & Sentry        │
└─────────────────────────────┴───────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  LOCAL DEVELOPMENT ARCHITECTURE             │
├─────────────────────────────┬───────────────────────────────┤
│ Docker Compose:             │                               │
│   ├── PostgreSQL            │ port 5432                     │
│   ├── Redis                 │ port 6379                     │
│   ├── Express API           │ port 5000                     │
│   └── Next.js Web           │ port 3000                     │
└─────────────────────────────┴───────────────────────────────┘
```

---

## 2. CI/CD Deployment Flow

```text
Push to main
     │
     ▼
[ GitHub Actions: deploy.yml ]
     │
     ├── 1. Quality Gate (Prisma generate + Lint + Vitest Tests + TypeScript Checks + Builds)
     │
     ├── 2. Deploy Web to Vercel
     │      ├── Uses Vercel CLI (vercel pull -> vercel build -> vercel deploy --prebuilt)
     │      └── Serves Next.js app on Vercel Edge Network
     │
     ├── 3. Production Health Check
     │      ├── Probes API at $API_HEALTH_URL/health
     │      └── Probes Web at $WEB_URL
     │
     └── 4. Deployment Summary

[ Northflank GitHub Integration (Independent Deployments) ]
     ├── API Service: Triggered on push to main via Dockerfile
     └── Worker Service: Triggered on push to main via apps/api/Dockerfile.worker
```

---

## 3. Required GitHub Secrets & Environments

Configure these secrets in GitHub Repository Settings $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**:

### GitHub Environments
Use the existing **production** environment:
- `production`

### Secrets Matrix

| Secret Name | Scope | Purpose |
|---|---|---|
| `VERCEL_TOKEN` | `production` / Repo | Vercel Access Token |
| `VERCEL_ORG_ID` | `production` / Repo | Vercel Team / Org ID |
| `VERCEL_PROJECT_ID` | `production` / Repo | Vercel Web Project ID |
| `API_HEALTH_URL` | `production` / Repo | Production API base URL (e.g., `https://api.yourdomain.com`) |
| `WEB_URL` | `production` / Repo | Production Web base URL (e.g., `https://yourdomain.com`) |
| `NEXT_PUBLIC_SENTRY_DSN` | `production` / Repo | Sentry DSN for frontend telemetry |

> **Note**: Obsolete secrets (`RAILWAY_TOKEN`, `RAILWAY_PROJECT`, `RAILWAY_SERVICE`) are no longer referenced and can be safely removed from GitHub Settings.

---

## 4. Production Environment Variables

### Northflank (Express API Service)

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:password@host/database?sslmode=require
REDIS_URL=rediss://default:password@host:port

JWT_SECRET=production_jwt_secret_min_32_chars
BETTER_AUTH_SECRET=production_better_auth_secret_min_32_chars
BETTER_AUTH_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

RESEND_API_KEY=re_prod_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_...
STRIPE_BUSINESS_YEARLY_PRICE_ID=price_...

GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GITHUB_OAUTH_CLIENT_ID=...
GITHUB_OAUTH_CLIENT_SECRET=...

OTEL_SERVICE_NAME=linkforge-api
OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4318
SENTRY_DSN=...
SENTRY_ENVIRONMENT=production
```

### Northflank (BullMQ Background Worker)

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
REDIS_URL=rediss://default:password@host:port
RESEND_API_KEY=re_prod_...
FRONTEND_URL=https://yourdomain.com
IP_HASH_SALT=linkforge-analytics-salt

OTEL_SERVICE_NAME=linkforge-worker
OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4318
SENTRY_DSN=...
SENTRY_ENVIRONMENT=production
```

### Vercel (Next.js Web Service)

```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_SENTRY_DSN=...
SENTRY_ENVIRONMENT=production
```

---

## 5. Local Development Workflow

Start the full local infrastructure with Docker Compose:

```bash
# Start local PostgreSQL and Redis
pnpm dev:infra

# Generate Prisma Client & Run database migrations
pnpm --filter api exec prisma migrate dev

# Start development servers
pnpm dev
```

---

## 6. Diagnostics & Troubleshooting

- **API Health Check Fails**: Verify `API_HEALTH_URL` responds with HTTP 200 at `/health`. Check Northflank API logs for startup exceptions.
- **Worker Health**: The worker is a long-running background service with 0 exposed ports. Inspect Northflank logs for BullMQ consumer startup and Redis connection.
- **CORS Errors**: Ensure `CORS_ORIGIN` and `FRONTEND_URL` on Northflank match the exact Vercel production domain.
- **OpenTelemetry Traces**: Ensure `OTEL_EXPORTER_OTLP_ENDPOINT` is configured in Northflank services.
