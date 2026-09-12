# Sentry Error Monitoring Implementation Walkthrough

Sentry error monitoring has been integrated into both the `api` (Express backend) and `web` (Next.js 16 frontend) applications without modifying the existing architecture, design, or unrelated functionality.

---

## 1. Summary of Changes

### Backend (`apps/api`)
- [apps/api/src/lib/sentry.ts](file:///d:/linkforge/apps/api/src/lib/sentry.ts): Initialized `@sentry/node` with dynamic loading of `SENTRY_DSN` from the environment.
- [apps/api/server.ts](file:///d:/linkforge/apps/api/server.ts): Imported Sentry early in the bootstrap lifecycle before server startup.
- [apps/api/main.ts](file:///d:/linkforge/apps/api/main.ts): Configured `Sentry.setupExpressErrorHandler(app)` ahead of custom error middleware.
- [apps/api/src/middlewares/error-handler.middleware.ts](file:///d:/linkforge/apps/api/src/middlewares/error-handler.middleware.ts): Added unhandled 5xx exception capture to Sentry while retaining the standard JSON error responses and status codes.
- [apps/api/src/routes/v1/sentry-test.route.ts](file:///d:/linkforge/apps/api/src/routes/v1/sentry-test.route.ts): Added isolated development-only test route `GET /api/v1/sentry-test` throwing `Sentry API integration test error`.
- [apps/api/src/routes/v1/index.ts](file:///d:/linkforge/apps/api/src/routes/v1/index.ts): Mounted `/sentry-test` route under `/api/v1`.

### Frontend (`apps/web`)
- Installed `@sentry/nextjs` (`^10.73.0`).
- [apps/web/sentry.client.config.ts](file:///d:/linkforge/apps/web/sentry.client.config.ts): Configured client-side Sentry monitoring using `NEXT_PUBLIC_SENTRY_DSN`.
- [apps/web/sentry.server.config.ts](file:///d:/linkforge/apps/web/sentry.server.config.ts): Configured server-side Sentry monitoring.
- [apps/web/sentry.edge.config.ts](file:///d:/linkforge/apps/web/sentry.edge.config.ts): Configured Edge runtime Sentry monitoring.
- [apps/web/instrumentation.ts](file:///d:/linkforge/apps/web/instrumentation.ts): Hooked Sentry lifecycle into Next.js App Router via `register()` and `onRequestError`.
- [apps/web/next.config.ts](file:///d:/linkforge/apps/web/next.config.ts): Wrapped Next.js config with `withSentryConfig`, preserving existing rewrites, remote image patterns, and standalone output settings.
- [apps/web/app/error.tsx](file:///d:/linkforge/apps/web/app/error.tsx) & [apps/web/app/global-error.tsx](file:///d:/linkforge/apps/web/app/global-error.tsx): Added error capture using `Sentry.captureException(error)`.
- [apps/web/app/sentry-test/page.tsx](file:///d:/linkforge/apps/web/app/sentry-test/page.tsx): Added isolated test page at `/sentry-test` to trigger test errors (`Sentry Web integration test error`).

### Environment Templates & Workspace Config
- [.env.example](file:///d:/linkforge/.env.example): Added placeholders for `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`.
- [apps/api/example.env](file:///d:/linkforge/apps/api/example.env): Added placeholder for `SENTRY_DSN`.
- [apps/web/example.env](file:///d:/linkforge/apps/web/example.env): Added placeholder for `NEXT_PUBLIC_SENTRY_DSN`.
- [pnpm-workspace.yaml](file:///d:/linkforge/pnpm-workspace.yaml): Enabled `@sentry/cli: true` in `allowBuilds`.

---

## 2. Environment Variables Required

| App | Variable | Description |
|---|---|---|
| `apps/api` | `SENTRY_DSN` | Ingest DSN for Node.js / Express backend |
| `apps/web` | `NEXT_PUBLIC_SENTRY_DSN` | Ingest DSN for Next.js client & server |

---

## 3. How to Trigger and Verify Sentry Events

### Backend Verification:
1. Start the API server:
   ```bash
   pnpm --filter api dev
   ```
2. Send a GET request to the test endpoint:
   ```bash
   curl http://localhost:5000/api/v1/sentry-test
   ```
3. **Expected result**:
   - HTTP status `500` with standard API error JSON response.
   - Sentry event captured with message: `"Sentry API integration test error"`.

### Frontend Verification:
1. Start the web application:
   ```bash
   pnpm --filter web dev
   ```
2. Navigate in browser to `http://localhost:3000/sentry-test`.
3. Click **Throw React Render Error** or **Trigger Sentry.captureException**.
4. **Expected result**:
   - Sentry event captured with message: `"Sentry Web integration test error"`.
