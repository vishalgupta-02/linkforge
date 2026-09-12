# Sentry Rich Error Context Implementation Walkthrough

Rich, actionable error context has been implemented across LinkFlow backend (`apps/api`) and frontend (`apps/web`), providing user identity, subscription plan, low-cardinality endpoint routes, and HTTP method tags for captured errors while preserving security, privacy, and request isolation under concurrency.

---

## 1. Summary of Changes

### Backend Context Enrichment & Privacy (`apps/api`)
- [`apps/api/src/lib/sentry.ts`](file:///d:/linkforge/apps/api/src/lib/sentry.ts) *(Modified)*:
  - Added `beforeSend` privacy filtering to strip `authorization`, `cookie`, `set-cookie`, `proxy-authorization`, `x-api-key`, and `stripe-signature` headers/cookies from all emitted events.
- [`apps/api/src/utils/sentry-context.ts`](file:///d:/linkforge/apps/api/src/utils/sentry-context.ts) *(Modified)*:
  - `getRoutePattern(req)`: Normalizes endpoints to route patterns (e.g., `/api/v1/users/:id`, `/api/v1/links`) to prevent high-cardinality tag explosions in Sentry.
  - `formatPlan(plan)`: Standardizes user plan names (`free`, `pro`, `business`).
  - `captureSentryWithRichContext(err, req)`: Applies request-isolated Sentry scopes (`Sentry.withScope`) to capture user ID and username in User Context, and `plan`, `endpoint`, `method` in Sentry Tags without cross-request state leakage.
  - Enforced strict tag cardinality: `username`, `user_id`, and `email` are **never** set as tags.
- [`apps/api/main.ts`](file:///d:/linkforge/apps/api/main.ts) *(Modified)*:
  - Removed duplicate `Sentry.setupExpressErrorHandler(app)` to prevent anonymous double error capture.
- [`apps/api/src/middlewares/error-handler.middleware.ts`](file:///d:/linkforge/apps/api/src/middlewares/error-handler.middleware.ts) *(Modified)*:
  - Connects `captureSentryWithRichContext` as the single authoritative Express error handler for all 5xx / unhandled server exceptions.
  - Retains existing HTTP status codes, error details, and API response shape.
- [`apps/api/src/middlewares/protected-routes.middleware.ts`](file:///d:/linkforge/apps/api/src/middlewares/protected-routes.middleware.ts) *(Modified)*:
  - Populates `request.user.userName` alongside `id`, `email`, and `plan` during session validation.
- [`apps/api/src/types/express.d.ts`](file:///d:/linkforge/apps/api/src/types/express.d.ts) *(Modified)*:
  - Updated `AuthUser` type definition to include `userName` and `username`.

### Frontend Sentry Privacy (`apps/web`)
- [`apps/web/sentry.server.config.ts`](file:///d:/linkforge/apps/web/sentry.server.config.ts) *(Modified)*:
  - Added `beforeSend` privacy filter to scrub sensitive headers, cookies, and tokens.
- [`apps/web/sentry.edge.config.ts`](file:///d:/linkforge/apps/web/sentry.edge.config.ts) *(Modified)*:
  - Added `beforeSend` privacy filter to scrub sensitive headers, cookies, and tokens.
- [`apps/web/sentry.client.config.ts`](file:///d:/linkforge/apps/web/sentry.client.config.ts) *(Modified)*:
  - Added `beforeSend` privacy filter to scrub sensitive headers, cookies, and tokens.

### Testing & Verification
- [`apps/api/src/routes/v1/sentry-test.route.ts`](file:///d:/linkforge/apps/api/src/routes/v1/sentry-test.route.ts) *(Modified)*:
  - Added development-only test routes:
    - `GET /api/v1/sentry-test` (unauthenticated trigger)
    - `GET /api/v1/sentry-test/auth` (authenticated trigger via `protectedRoute`)
- [`apps/api/tests/sentry-context.test.ts`](file:///d:/linkforge/apps/api/tests/sentry-context.test.ts) *(Modified)*:
  - Comprehensive automated test suite validating:
    1. Endpoint pattern extraction & ID normalization
    2. Plan normalization
    3. Authenticated error capture (User ID, username, plan, endpoint, method)
    4. Cardinality enforcement: asserts `username` and `user_id` are NOT tags
    5. Unauthenticated error capture (absence of user/plan, no context leakage)
    6. Concurrent user context isolation (Alice vs Bob)
    7. Performance span wrapper tracking
    8. Error handler HTTP contract preservation
- [`apps/api/package.json`](file:///d:/linkforge/apps/api/package.json) *(Modified)*:
  - Configured `"test:sentry": "tsx tests/sentry-context.test.ts"` script.

---

## 2. Sentry Context & Tag Specifications

### Sentry User Context
```text
User
├── id: <internal-user-id>
└── username: <username>
```

### Sentry Tags (Low-Cardinality Only)
| Tag | Example Values | Source | Description |
|---|---|---|---|
| `plan` | `free`, `pro`, `business` | `user.plan` | User's active subscription tier (omitted if unauthenticated) |
| `endpoint` | `/api/v1/links`, `/api/v1/users/:id` | `req.route?.path` or normalized path | Parameterized route pattern or normalized path |
| `method` | `GET`, `POST`, `PUT`, `DELETE` | `req.method` | Request HTTP verb |

> [!IMPORTANT]
> **Cardinality Rule**: `username`, `user_id`, `email`, and dynamic database IDs are **strictly excluded** from Sentry tags and reside exclusively in Sentry User Context to prevent high-cardinality telemetry explosion.

---

## 3. Privacy & Security Protections
- **Excluded Sensitive Data**: Passwords, password hashes, JWTs, access/refresh tokens, session cookies, Authorization headers, Stripe secrets, and raw request bodies containing sensitive information are excluded from Sentry.
- **Privacy Filtering (`beforeSend`)**: Strips `authorization`, `cookie`, `set-cookie`, `x-api-key`, and `stripe-signature` from event payloads.
- **Minimal User Identity**: Only internal user ID (`id`) and username (`username`) are included in the user block.
- **Fail-Safe Operation**: Any Sentry enrichment or capture failure is safely caught so API error responses always succeed.
- **Strict Scope Isolation**: Scopes are generated per error capture using `Sentry.withScope`, ensuring concurrent user contexts never bleed across requests.

---

## 4. How to Verify

### Automated Test Suite:
Run the standalone Sentry context test suite:
```bash
pnpm --filter api test:sentry
```

### Manual API Trigger:
- **Unauthenticated Test Error**:
  ```bash
  curl http://localhost:5000/api/v1/sentry-test
  ```
- **Authenticated Test Error**:
  ```bash
  curl -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN" http://localhost:5000/api/v1/sentry-test/auth
  ```

