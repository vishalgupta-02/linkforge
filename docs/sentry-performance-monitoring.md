# Sentry Performance Monitoring Implementation Walkthrough

Sentry Performance Monitoring has been configured across both the `api` (Express backend) and `web` (Next.js frontend) applications with a **10% trace sample rate** (`tracesSampleRate = 0.1`), automatic and child span tracking, and low-cardinality transaction naming.

---

## 1. Summary of Changes

### Backend (`apps/api`)
- [`apps/api/src/lib/sentry.ts`](file:///d:/linkforge/apps/api/src/lib/sentry.ts): Configured `tracesSampleRate: 0.1` (10% sampling) alongside existing DSN and environment settings.
- [`apps/api/src/utils/sentry-context.ts`](file:///d:/linkforge/apps/api/src/utils/sentry-context.ts): Added `trackSpan(options, fn)` helper for manual diagnostic spans using `Sentry.startSpan`.
- [`apps/api/src/routes/v1/sentry-test.route.ts`](file:///d:/linkforge/apps/api/src/routes/v1/sentry-test.route.ts): Added a controlled multi-span development test endpoint `GET /api/v1/sentry-test/performance` demonstrating cache, DB, and serialization spans.
- [`apps/api/tests/sentry-context.test.ts`](file:///d:/linkforge/apps/api/tests/sentry-context.test.ts): Extended test suite to cover performance span creation and execution.

### Frontend (`apps/web`)
- [`apps/web/sentry.client.config.ts`](file:///d:/linkforge/apps/web/sentry.client.config.ts): Configured `tracesSampleRate: 0.1`.
- [`apps/web/sentry.server.config.ts`](file:///d:/linkforge/apps/web/sentry.server.config.ts): Configured `tracesSampleRate: 0.1`.
- [`apps/web/sentry.edge.config.ts`](file:///d:/linkforge/apps/web/sentry.edge.config.ts): Configured `tracesSampleRate: 0.1`.

---

## 2. Sampling Configuration

- **Effective Rate**: Exactly **10%** (`tracesSampleRate = 0.1`).
- **Scope**: Applied uniformly across backend API requests and Next.js client/server/edge transactions.

---

## 3. Performance Tracing Architecture

```text
Incoming HTTP Request
      ↓
Sentry Auto-Instrumentation (HTTP/Express)
      ↓
Route Handlers & Child Spans:
  ├── Redis Cache Spans (`cache.get`, `cache.set`)
  ├── Prisma Database Spans (`db.query`)
  ├── External HTTP Spans (`http.client`)
  └── Custom Business Spans (`trackSpan`)
      ↓
Transaction Finished & Sampled (10%)
```

---

## 4. How to Investigate a Slow Endpoint

Follow this step-by-step workflow in the Sentry UI to analyze and resolve API performance bottlenecks:

1. **Open Sentry Performance**: Navigate to the **Performance** tab in your Sentry dashboard.
2. **Filter Environment**: Set `environment: production` (or your target staging environment).
3. **Group by Endpoint / Transaction**: View transactions grouped by normalized route pattern (e.g., `/api/v1/links`, `/api/v1/users/:id`).
4. **Sort by p95 Duration**: Sort by p95 or p75 latency to identify endpoints with long-tail latency issues affecting users.
5. **Open Slow Transaction**: Click on the slowest transaction to view aggregate span breakdowns and recent transaction events.
6. **Inspect Child Spans**: Look at the waterfall trace to isolate where the time was spent:
   - **Database (`db.query`)**: High duration indicates unindexed queries, connection pool exhaustion, or large payloads.
   - **Cache (`cache.get`, `cache.set`)**: Slow Redis roundtrips or cache misses.
   - **External HTTP (`http.client`)**: Latency from third-party APIs (e.g., Stripe, Cloudinary, Resend).
   - **Application (`serialize`, `compute`)**: Heavy synchronous CPU operations or blocking event loops.
7. **Identify & Fix the Bottleneck**: Add database indexes, introduce Redis caching, parallelize external requests, or optimize algorithms.
8. **Re-measure**: Deploy changes and verify latency reduction in Sentry Performance metrics.

---

## 5. Privacy & Security Protections

- **Data Scrubbing**: All sensitive HTTP headers (`authorization`, `cookie`, `set-cookie`, `proxy-authorization`, `x-api-key`, `stripe-signature`) and cookies are stripped by `beforeSend`.
- **Excluded Secrets**: Credentials, database URLs, Redis connection strings, passwords, and raw request bodies are excluded from spans and transaction context.
- **Low-Cardinality Tags**: Dynamic IDs and query parameters are parameterized or omitted to keep telemetry clean and avoid tag explosion.

---

## 6. Verification

### Automated Unit & Performance Tests:
```bash
pnpm --filter api test:sentry
```

### Manual Performance Test Endpoint:
```bash
curl http://localhost:5000/api/v1/sentry-test/performance
```
- Executes a multi-step transaction with distinct child spans (`cache.check`, `db.query.sample_data`, `data.serialization`).

