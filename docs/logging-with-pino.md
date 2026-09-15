# Walkthrough - Production-Ready Structured Logging with Pino & Async Request Correlation

This document summarizes the end-to-end implementation of production-ready structured logging using **Pino** and Node.js **`AsyncLocalStorage`** across the Linkforge Express API, background workers, and observability stack.

---

## 1. Target Architecture & Request Correlation

Every log line emitted anywhere during an HTTP request automatically includes the same `requestId`, `userId` (when authenticated), and active OpenTelemetry `traceId`/`spanId`:

```text
HTTP Request
     │
     ▼
Request ID & AsyncLocalStorage Middleware
     │ (Validates/sanitizes X-Request-ID, runs AsyncLocalStorage context)
     │ (Sets X-Request-ID response header)
     ▼
Route Middlewares (CORS, Rate Limit, Helmet)
     │
     ▼
Authentication Middleware (protectedRoute)
     │ (Validates session, enriches AsyncLocalStorage with userId)
     ▼
Controller & Service Logic
     │ (Calls logger.info / logger.error / logger.debug)
     │ (Pino pulls requestId & userId from AsyncLocalStorage + traceId from OpenTelemetry)
     ▼
Database (PostgreSQL / Prisma) & Cache (Redis)
     │
     ▼
HTTP Response Finish
     │ (Logs request completion with method, route, statusCode, durationMs)
     ▼
Client receives response with X-Request-ID header
```

---

## 2. Key Components Implemented

### A. Async Request Context Storage
- [`apps/api/src/lib/request-context.ts`](file:///d:/linkforge/apps/api/src/lib/request-context.ts):
  - Wraps Node's native `AsyncLocalStorage<RequestContext>`.
  - Exposes `getRequestId()`, `getUserId()`, `runWithContext()`, and `updateUserContext()`.
  - Eliminates the anti-pattern of passing `requestId` through every function parameter.

### B. Centralized Pino Logger
- [`apps/api/src/lib/logger.ts`](file:///d:/linkforge/apps/api/src/lib/logger.ts):
  - Configures `pino` with ISO-8601 timestamps, string level labels, and `messageKey: 'message'`.
  - Automatically merges context from `AsyncLocalStorage` (`requestId`, `userId`) and OpenTelemetry (`traceId`, `spanId`).
  - Sensitive data redaction for passwords, tokens, API keys, cookies, auth headers, and Stripe secrets.
  - Sentry breadcrumb integration for non-fatal log tracking.
  - Safe defaults for non-HTTP logs (`requestId: null`, `userId: null`).

### C. Request ID & Lifecycle Middleware
- [`apps/api/src/middlewares/request-id.middleware.ts`](file:///d:/linkforge/apps/api/src/middlewares/request-id.middleware.ts):
  - Sanitizes incoming `X-Request-ID` headers against `^[a-zA-Z0-9_-]{1,128}$`.
  - Generates secure `req_<uuid>` when missing or invalid.
  - Echoes `X-Request-ID` on response headers.
  - Logs request completion on `res.on('finish')` with monotonic `process.hrtime.bigint()` duration (`durationMs`), status code, and route normalization. (Filters `/health` and `/metrics` to `debug` level).

### D. User Context Enrichment
- [`apps/api/src/middlewares/protected-routes.middleware.ts`](file:///d:/linkforge/apps/api/src/middlewares/protected-routes.middleware.ts):
  - Dynamically enriches active request context with authenticated `userId` via `updateUserContext(session.user.id)`.

### E. Background Workers & Server Startup
- [`apps/api/src/workers/click.worker.ts`](file:///d:/linkforge/apps/api/src/workers/click.worker.ts) & [`apps/api/src/workers/email.worker.ts`](file:///d:/linkforge/apps/api/src/workers/email.worker.ts): Replaced unstructured `console.log` with structured `logger.info` and `logger.error` including worker context (`jobId`, `queue`, `attempt`).
- [`apps/api/server.ts`](file:///d:/linkforge/apps/api/server.ts) & [`apps/api/src/worker.ts`](file:///d:/linkforge/apps/api/src/worker.ts): Structured startup logging.

---

## 3. Log Schema Specifications

### Inbound HTTP Request Example
```json
{
  "timestamp": "2026-09-12T15:30:00.123Z",
  "level": "info",
  "requestId": "req_c4b182d3-1249-4328-98e1-51829e182390",
  "userId": "usr_42",
  "message": "Link created successfully",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "linkId": "link_123"
}
```

### Request Completion Log Example
```json
{
  "timestamp": "2026-09-12T15:30:00.185Z",
  "level": "info",
  "requestId": "req_c4b182d3-1249-4328-98e1-51829e182390",
  "userId": "usr_42",
  "message": "HTTP request completed",
  "method": "POST",
  "route": "/api/v1/links",
  "statusCode": 201,
  "durationMs": 42.15
}
```

### Non-HTTP Worker Log Example
```json
{
  "timestamp": "2026-09-12T15:30:01.050Z",
  "level": "info",
  "requestId": null,
  "userId": null,
  "message": "Click tracking job completed",
  "queue": "click-tracking",
  "jobId": "824",
  "linkId": "link_123"
}
```

---

## 4. Verification Suite

Run the automated test suites:
- `pnpm --filter api test:logger` (10 tests covering schema, async propagation, concurrency isolation, redaction, error formatting, OpenTelemetry trace correlation, and HTTP lifecycle).
- `pnpm --filter api test:tracing`
- `pnpm --filter api test:metrics`
- `pnpm --filter api test:sentry`
