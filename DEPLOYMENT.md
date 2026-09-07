# LinkFlow Production Deployment Guide

This document outlines the deployment architecture, configuration steps, and CI/CD pipelines for LinkFlow.

---

## 1. System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION ARCHITECTURE                  │
├─────────────────────────────┬───────────────────────────────┤
│ Frontend                    │ Vercel (Next.js 16 SSR/Edge)  │
│ Backend API                 │ Railway (Express + Node 20)   │
│ Database                    │ Managed PostgreSQL (Prisma)   │
│ Cache & Queues              │ Managed Redis (BullMQ)        │
│ Reverse Proxy / CDN         │ Vercel Edge Network           │
└─────────────────────────────┴───────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  LOCAL DEVELOPMENT ARCHITECTURE             │
├─────────────────────────────────────────────────────────────┤
│ Docker Compose:                                             │
│   ├── PostgreSQL (port 5432)                                │
│   ├── Redis (port 6379)                                     │
│   ├── API (port 5000)                                       │
│   └── Web (port 3000)                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. CI/CD Deployment Flow

```text
Push to main
     │
     ▼
[ GitHub Actions: deploy.yml ]
     │
     ├── 1. Quality Gate (Lint + Vitest Tests + TypeScript Checks + Builds)
     │
     ├── 2. Deploy API to Railway
     │      ├── Uses @railway/cli (railway up --ci)
     │      └── Runs: prisma migrate deploy && node dist/server.js
     │
     ├── 3. Deploy Web to Vercel
     │      ├── Uses vercel CLI (vercel pull -> vercel build -> vercel deploy --prebuilt)
     │      └── Serves Next.js app on Vercel Edge Network
     │
     ├── 4. Production Health Check
     │      ├── Probes API at $API_HEALTH_URL/health
     │      └── Probes Web at $WEB_URL
     │
     └── 5. Deployment Success Notification
```

---

## 3. Required GitHub Secrets & Environments

Configure these secrets in GitHub Repository Settings $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**:

### GitHub Environments
Create two environments under **Settings** $\rightarrow$ **Environments**:
1. `production-api`
2. `production-web`
3. `production`

### Secrets Matrix

| Secret Name | Scope | Purpose |
|---|---|---|
| `RAILWAY_TOKEN` | `production-api` or Repo | Railway API token for CLI deployment |
| `RAILWAY_PROJECT` | `production-api` or Repo | Railway Project ID or Name |
| `RAILWAY_SERVICE` | `production-api` or Repo | Railway Service Name for the API |
| `VERCEL_TOKEN` | `production-web` or Repo | Vercel Access Token |
| `VERCEL_ORG_ID` | `production-web` or Repo | Vercel Team / Org ID |
| `VERCEL_PROJECT_ID` | `production-web` or Repo | Vercel Web Project ID |
| `API_HEALTH_URL` | `production` or Repo | Production API base URL (e.g., `https://api.yourdomain.com`) |
| `WEB_URL` | `production` or Repo | Production Web base URL (e.g., `https://yourdomain.com`) |

---

## 4. Production Environment Variables

### Railway (Express API Service)

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
REDIS_URL=redis://default:password@host:port

JWT_SECRET=production_jwt_secret_min_32_chars
BETTER_AUTH_SECRET=production_better_auth_secret_min_32_chars
BETTER_AUTH_URL=https://api.yourdomain.com/api/auth
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

RESEND_API_KEY=re_prod_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_...
STRIPE_BUSINESS_YEARLY_PRICE_ID=price_...

LINKFLOW_CLOUDINARY_CLOUD_NAME=...
LINKFLOW_CLOUDINARY_API_KEY=...
LINKFLOW_CLOUDINARY_API_SECRET=...

GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GITHUB_OAUTH_CLIENT_ID=...
GITHUB_OAUTH_CLIENT_SECRET=...
```

### Vercel (Next.js Web Service)

```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
BACKEND_INTERNAL_URL=https://api.yourdomain.com
```

---

## 5. Local Development Workflow

Start the full local infrastructure with Docker Compose:

```bash
# Start local PostgreSQL and Redis
pnpm dev:infra

# Run database migrations locally
pnpm --filter api exec prisma migrate dev

# Start development servers
pnpm dev
```

---

## 6. Database Migrations

- In development: `pnpm --filter api exec prisma migrate dev`
- In production: Railway executes `pnpm --filter api exec prisma migrate deploy` prior to starting `node dist/server.js` (configured in [`apps/api/railway.json`](file:///d:/linkforge/apps/api/railway.json)).

---

## 7. Diagnostics & Troubleshooting

- **Health Check Fails**: Verify `API_HEALTH_URL` responds with HTTP 200 at `/health`. Check Railway logs for startup exceptions.
- **CORS Errors**: Ensure `CORS_ORIGIN` and `FRONTEND_URL` on Railway match the exact Vercel production domain.
- **Vercel Build Fails**: Ensure `NEXT_PUBLIC_BACKEND_URL` is set in Vercel Environment Variables.
