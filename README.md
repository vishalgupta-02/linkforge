<div align="center">

# LinkForge

**High-Performance, Developer-Grade Link-in-Bio & Real-Time Creator Analytics Platform**

[![CI](https://github.com/vishalgupta-02/linkforge/actions/workflows/ci.yml/badge.svg)](https://github.com/vishalgupta-02/linkforge/actions/workflows/ci.yml)
[![Tests](https://github.com/vishalgupta-02/linkforge/actions/workflows/test.yml/badge.svg)](https://github.com/vishalgupta-02/linkforge/actions/workflows/test.yml)
[![License: MIT-0](https://img.shields.io/badge/License-MIT--0-blue.svg)](LICENSE)
[![pnpm](https://img.shields.io/badge/pnpm-11.21.0-orange.svg)](https://pnpm.io/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black.svg)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-5.2.1-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-red.svg)](https://redis.io/)

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#system-architecture">System Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#repository-structure">Repository Structure</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#environment-configuration">Environment Variables</a> •
  <a href="#api-reference">API Overview</a> •
  <a href="#testing--quality">Testing</a> •
  <a href="#observability">Observability</a> •
  <a href="#contributing">Contributing</a>
</p>

</div>

---

## Overview

**LinkForge** is an open-source, full-stack, multi-tenant link-in-bio platform engineered for creators, professionals, and digital brands. It consolidates fragmented social links, portfolios, and external destinations into a single fast, mobile-optimized landing page while capturing real-time visitor intelligence (geography, device types, browser clients, and referral sources) with sub-second redirect throughput.

Unlike conventional link hubs that execute synchronous database writes during redirection, LinkForge decouples public URL resolution from analytics ingestion via **Redis** caching and **BullMQ** asynchronous background workers.

---

## Key Features

- **Dynamic Link Management**: Add, edit, soft-delete, toggle visibility, and reorder links seamlessly with `@dnd-kit` touch-friendly drag-and-drop.
- **Social Media Profiles & Separate Tracking**: Add and reorder social icons (Instagram, GitHub, X/Twitter, LinkedIn, YouTube, Discord, etc.) with dedicated click tracking per platform.
- **Tiered Creator Analytics**:
  - **Free Tier**: Real-time total clicks, traffic trends, and top-performing social platform highlight.
  - **Pro Tier**: Granular multi-platform click breakdowns with percentage shares, geographic country distribution with flags, device distribution (Desktop/Mobile/Tablet), and referral source breakdown.
- **Ultra-Low Latency Redirection (`/r/:publicId`)**: Immediate `302 Found` redirects while dispatching asynchronous click jobs to BullMQ queues.
- **Robust Multi-Provider Authentication**: Email/password authentication, session management, and Google/GitHub OAuth via Better-Auth.
- **Monetization & Subscriptions**: Stripe Checkout and Customer Portal integration with automated webhook synchronization and PlanGuard RBAC middleware (`FREE`, `PRO`, `BUSINESS`).
- **Transactional Email Engine**: React Email JSX templates delivered via Resend and BullMQ queues (Welcome, Milestone Alerts, Pro Upgrades, Password Resets).
- **End-to-End Observability**:
  - **OpenTelemetry SDK**: Distributed tracing auto-instrumenting Express, HTTP, pg, and ioredis, exported to Grafana Tempo.
  - **Prometheus & Alertmanager**: Live metric collection at `/metrics` with custom business metrics (`user_signups`, `clicks_processed`).
  - **Sentry SDK**: Error reporting and performance profiling across frontend and backend.
  - **Pino Logger**: High-throughput structured JSON logging with request ID correlation.

---

## ️ System Architecture

```mermaid
flowchart TD
    Client([Visitor / Creator Browser]) -->|HTTPS| Web[Next.js 16 Web App]
    Client -->|Public Redirect /r/:publicId| API[Express 5 REST API]
    
    subgraph Frontend Application [apps/web]
        Web -->|TanStack Query| API
        Web -->|Client State| Zustand[Zustand Store]
    end

    subgraph Backend Core [apps/api]
        API --> Middleware[Middleware Stack: RequestId, Prometheus, CORS, Helmet, RateLimiter]
        Middleware --> Router[API Router v1: Users, Links, Socials, Analytics, Billing]
        Router --> Auth[Better-Auth Session & Guards]
        Router --> Services[Business Services]
        
        Services --> Prisma[Prisma ORM Client]
        Services --> RedisCache[(Redis 7 Cache)]
        Services --> BullQueue[BullMQ Job Producers]
    end

    subgraph Data Persistence
        Prisma --> Postgres[(PostgreSQL 16 Database)]
    end

    subgraph Background Workers [apps/api/src/worker.ts]
        BullQueue -->|track-click| ClickWorker[Click Ingestion Worker]
        BullQueue -->|send-email| EmailWorker[Email Dispatch Worker]
        
        ClickWorker -->|GeoIP & UA Parser| Postgres
        ClickWorker -->|Milestone Check| BullQueue
        EmailWorker -->|JSX Render| Resend[Resend API]
    end

    subgraph Telemetry & Monitoring
        API -.->|Scrape /metrics| Prometheus[(Prometheus)]
        Prometheus --> Grafana[Grafana Dashboards]
        Prometheus --> Alertmanager[Alertmanager]
        API -.->|OTLP Traces| Tempo[(Grafana Tempo)]
        API -.->|Exceptions & Spans| Sentry[Sentry Cloud]
    end
```

---

## ️ Tech Stack

| Layer | Technologies |
|---|---|
| **Monorepo** | [pnpm Workspaces](https://pnpm.io/workspaces) (v11.21.0), TypeScript 5.9.3 |
| **Frontend (`apps/web`)** | Next.js 16.1.6 (App Router), React 19, Tailwind CSS v4, Radix UI, TanStack React Query v5, Zustand, Recharts, @dnd-kit, Framer Motion |
| **Backend (`apps/api`)** | Express 5.2.1, Node.js 20+, Prisma ORM 7.8, Better-Auth, BullMQ 5.76, ioredis, Zod, Helmet, Stripe SDK, Resend, Multer, Cloudinary, geoip-lite |
| **Database & Cache** | PostgreSQL 16 (Relational DB), Redis 7 (Cache, Rate Limiting, BullMQ queues) |
| **Observability** | OpenTelemetry, Prometheus (`prom-client`), Grafana, Tempo, Sentry Node SDK, Pino |
| **Infrastructure** | Docker, Docker Compose, Nginx Reverse Proxy, GitHub Actions CI/CD |

---

## Repository Structure

```text
linkforge/
├── apps/
│   ├── api/                          # Express 5 REST API & BullMQ Background Workers
│   │   ├── prisma/                   # Prisma database schema, migrations & seed scripts
│   │   ├── src/
│   │   │   ├── configs/              # Environment configurations & validation
│   │   │   ├── controllers/          # HTTP controllers (auth, links, socials, analytics, billing)
│   │   │   ├── cron/                 # Scheduled background jobs (e.g., soft-delete cleanup)
│   │   │   ├── emails/               # React Email transactional email templates
│   │   │   ├── lib/                  # Singletons (Redis, Auth, Sentry, Pino, Prometheus, Stripe)
│   │   │   ├── middlewares/          # Auth, CORS, Helmet, RateLimiter, RequestId, Metrics
│   │   │   ├── queues/               # BullMQ queue producers (clickQueue, emailQueue)
│   │   │   ├── routes/               # Express routing hierarchy (/api/v1/...)
│   │   │   ├── services/             # Core business logic & database queries
│   │   │   ├── utils/                # GeoIP lookup, UA parsing, password hashing
│   │   │   ├── validators/           # Zod schema validation rules
│   │   │   ├── worker.ts             # Dedicated BullMQ worker process entry point
│   │   │   └── workers/              # BullMQ queue consumers (click.worker, email.worker)
│   │   ├── tests/                    # Integration & unit test suites
│   │   ├── main.ts                   # Express app configuration & middleware pipeline
│   │   └── server.ts                 # HTTP server listener
│   │
│   └── web/                          # Next.js 16 Frontend Web Application
│       ├── apis/                     # Axios API clients
│       ├── app/                      # Next.js App Router ((auth), (dashboard), (user), (onboarding))
│       ├── components/               # Custom UI & Radix UI / Shadcn component library
│       ├── hooks/                    # Custom React hooks (useSocialLinks, useUserProfile, etc.)
│       ├── lib/                      # Client utilities & Better-Auth client
│       └── store/                    # Zustand client state stores
│
├── packages/
│   └── types/                        # Shared TypeScript interfaces & types across apps
│
├── infra/                            # Local development & telemetry infrastructure
│   ├── alertmanager/                 # Prometheus alert rules & configuration
│   ├── docker-compose.yml            # Local PostgreSQL 16 & Redis 7 containers
│   ├── grafana/                      # Grafana dashboards & datasource provisioning
│   ├── prometheus/                   # Prometheus scrape configurations & alert rules
│   └── tempo/                        # Grafana Tempo distributed trace storage
│
├── docs/                             # Architecture dossiers, PRD, and observability guides
├── .github/                          # CI/CD Workflows, issue & PR templates, dependabot
├── docker-compose.prod.yml           # Production multi-container deployment orchestration
├── DEPLOYMENT.md                     # Production deployment guide (Railway + Vercel / Docker)
├── CONTRIBUTING.md                   # Contributor guide & commit conventions
└── SECURITY.md                       # Vulnerability disclosure policy
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js**: `v20.x` or `v24.x` (LTS recommended)
- **pnpm**: `v11.21.0` or later (`corepack enable && corepack prepare pnpm@11.21.0 --activate`)
- **Docker & Docker Compose**: For local PostgreSQL and Redis services

---

### Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/vishalgupta-02/linkforge.git
cd linkforge
```

#### 2. Install Dependencies
```bash
pnpm install
```

#### 3. Configure Environment Variables
Copy the root `.env.example` template to `.env` and configure your local parameters:
```bash
cp .env.example .env
cp apps/api/example.env apps/api/.env
```

#### 4. Start Infrastructure Services
Start the local PostgreSQL and Redis containers using Docker Compose:
```bash
pnpm dev:infra
```
*This starts PostgreSQL on port `5433` (mapped to container `5432`) and Redis on port `6379`.*

#### 5. Initialize the Database
Generate the Prisma Client and push the schema to your local database:
```bash
# Generate Prisma Client
pnpm --filter api exec prisma generate

# Apply database schema
pnpm --filter api exec prisma db push

# (Optional) Seed initial data
pnpm --filter api db:seed
```

#### 6. Start Development Servers
Run the full monorepo development suite (API + Web Frontend):
```bash
pnpm dev
```
- **Web Application**: [http://localhost:3000](http://localhost:3000)
- **API Server**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

#### 7. (Optional) Run Background Workers & Email Preview
```bash
# Run BullMQ background worker in watch mode
pnpm --filter api worker

# Preview React Email templates in browser
pnpm email:dev
```

---

## ️ Environment Configuration

| Variable | Required | Default / Example | Purpose |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | `postgresql://postgres:password@localhost:5432/linkforge?schema=public` | PostgreSQL connection string |
| `REDIS_URL` | **Yes** | `redis://:password@localhost:6379` | Redis connection URL for caching & BullMQ |
| `PORT` | No | `5000` | Express API listener port |
| `JWT_SECRET` | **Yes** | `min-32-character-secret-key` | Token signature cryptographic key |
| `BETTER_AUTH_SECRET` | **Yes** | `min-32-character-secret-key` | Better-Auth session encryption secret |
| `BETTER_AUTH_URL` | **Yes** | `http://localhost:5000/api/auth` | Base URL for Better-Auth endpoints |
| `FRONTEND_URL` | **Yes** | `http://localhost:3000` | Frontend web URL (used for CORS & email links) |
| `NEXT_PUBLIC_BACKEND_URL`| **Yes** | `http://localhost:5000` | Backend API URL exposed to frontend browser |
| `RESEND_API_KEY` | Optional | `re_123...` | API key for transactional email delivery |
| `STRIPE_SECRET_KEY` | Optional | `sk_test_...` | Stripe payment gateway secret key |
| `STRIPE_WEBHOOK_SECRET` | Optional | `whsec_...` | Webhook signature verification secret |
| `GOOGLE_CLIENT_ID` | Optional | `your-google-client-id` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | `your-google-client-secret` | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | Optional | `your-github-client-id` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | Optional | `your-github-client-secret` | GitHub OAuth client secret |
| `SENTRY_DSN` | Optional | `https://...@sentry.io/...` | Sentry error monitoring DSN |
| `OTEL_EXPORTER_OTLP_ENDPOINT`| Optional| `http://localhost:4318/v1/traces`| OpenTelemetry Tempo trace collector |

---

## Key API Routes

All REST endpoints follow standard JSON envelopes (`{ success, message, data, statusCode }`).

### Public & Authentication Endpoints
- `GET /health`: Service liveness check.
- `GET /r/:publicId`: Fast redirect to destination URL; records click asynchronously.
- `GET /api/v1/links/profile/:username/links`: Fetch active links and social profiles for a public page.
- `POST /api/v1/auth/signup`: Register new account with email & password.
- `POST /api/v1/auth/signin`: Authenticate session.
- `POST /api/v1/auth/forgot-password`: Dispatch password reset email.
- `POST /api/v1/auth/reset-password`: Reset password with cryptographic token.

### Creator Workspace Endpoints (`protectedRoute`)
- `GET /api/v1/users/me`: Fetch authenticated user profile.
- `PATCH /api/v1/users/profile`: Update profile info, bio, avatar.
- `GET /api/v1/links/get-links`: List creator links.
- `POST /api/v1/links/create`: Create a new link.
- `PATCH /api/v1/links/reorder`: Atomic reordering transaction.
- `GET /api/v1/socials`: List creator social links.
- `POST /api/v1/socials`: Create a social link.
- `PATCH /api/v1/socials/reorder`: Atomic social link reordering transaction.
- `GET /api/v1/analytics`: Fetch aggregated click intelligence with tiered breakdown.
- `POST /api/v1/billing/checkout/pro`: Create Stripe checkout session for Pro upgrade.

---

## Testing & Quality

LinkForge enforces automated linting, type-checking, and test suites across the monorepo:

```bash
# Run all linter checks
pnpm lint

# Run type checks
pnpm --filter api exec tsc --noEmit
pnpm --filter web exec tsc --noEmit

# Run API integration tests
pnpm --filter api test:links
pnpm --filter api test:socials
pnpm --filter api test:redirect
pnpm --filter api test:password-reset
pnpm --filter api test:metrics

# Build all packages for production
pnpm build
```

---

## Observability & Operations

- **Health Check**: `GET /health` (returns `200 OK` and status message)
- **Prometheus Metrics**: `GET /metrics` (scrapes HTTP latency histograms, memory usage, and business counters)
- **Bull Board Dashboard**: `GET /admin/queues` (interactive BullMQ queue inspection, protected by admin auth)
- **Distributed Tracing**: Exported to Grafana Tempo via OpenTelemetry SDK.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, development workflow, and commit message conventions ([Conventional Commits](https://www.conventionalcommits.org/)).

---

## Security

For security vulnerability disclosures, please review our [Security Policy](SECURITY.md). Do not file public GitHub issues for security vulnerabilities.

---

## License

This project is licensed under the **MIT-0 License** — see the [LICENSE](LICENSE) file for details.
