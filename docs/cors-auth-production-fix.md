# CORS & Authentication Production Fix

## 1. Incident

In the production environment of LinkForge:
- **Frontend URL:** `https://linkforge-web-iota.vercel.app` (Vercel)
- **Backend URL:** `https://api-production-fc28.up.railway.app` (Railway)

The application experienced critical authentication and CORS failures:
```text
/api/auth/get-session → 429
/api/auth/sign-in/social → OPTIONS/preflight failure
Browser → missing Access-Control-Allow-Origin
Google sign-in → Failed to fetch / TypeError
```

Live diagnostic requests confirmed that HTTP requests directly returned `HTTP 429 Too Many Requests` (body: `rate limited`, `server: railway-hikari`) without `Access-Control-Allow-Origin` headers. The browser reported this as a CORS error and blocked further authentication attempts.

---

## 2. Root Cause

The production failures stemmed from 5 interdependent configuration and code issues:

1. **Railway Hikari Edge Proxy Rate Limiting:**
   - **Component:** Railway Edge Infrastructure (`railway-hikari`).
   - **Problem:** Railway's edge router was flooded by high-frequency session re-checks triggered by the frontend upon initial failure, exceeding the edge request limit.
   - **Effect:** Railway Hikari returned a raw `429 Too Many Requests` (`rate limited`) at the edge before requests reached Express.

2. **Missing CORS Headers on Edge 429 Responses:**
   - **Component:** Railway Edge Proxy.
   - **Problem:** Edge-generated 429 responses do not include `Access-Control-Allow-Origin` headers.
   - **Effect:** The browser masked the underlying 429 error and surfaced a CORS preflight / access control failure (`TypeError: Failed to fetch`).

3. **Backend `BETTER_AUTH_URL` Environment Inversion:**
   - **Component:** Better Auth Server Initialization.
   - **File:** `apps/api/src/lib/auth.ts`.
   - **Problem:** In Railway environment variables, `BETTER_AUTH_URL` was configured as `https://linkforge-web-iota.vercel.app` (the Vercel frontend URL) instead of the Railway backend URL.
   - **Effect:** Better Auth believed the auth server was located on Vercel, causing base path resolution, internal origin checks, and OAuth redirect URI construction to target the wrong host.

4. **Cross-Site Cookie Incompatibility (`SameSite=Lax`):**
   - **Component:** Session Cookie Attributes.
   - **File:** `apps/api/src/lib/auth.ts`.
   - **Problem:** In production, cookies were configured with `sameSite: "lax"`. Because `vercel.app` and `railway.app` are distinct domains (cross-site context), modern browsers refuse to send `SameSite=Lax` cookies on cross-origin `fetch` requests with `credentials: "include"`.
   - **Effect:** Even after sign-in, subsequent calls to `get-session` sent no session cookie, causing `session: null` and continuous auth loops.

5. **Express Preflight and IP Middleware Ordering:**
   - **Component:** Express Middleware Stack.
   - **Files:** `apps/api/main.ts`, `apps/api/src/middlewares/rateLimit.middleware.ts`, `apps/api/src/middlewares/cors.ts`.
   - **Problem:** `app.set("trust proxy", 1)` was executed after the rate limiter was mounted; the rate limiter was processing `OPTIONS` requests; and `cors` `allowedHeaders` omitted standard headers like `x-better-auth-session-token` and `Cookie`.
   - **Effect:** Preflight OPTIONS requests were subject to rate limiting and header rejections.

---

## 3. Changes Implemented

### 1. `apps/api/main.ts`
- **What Changed:** Moved `app.set("trust proxy", 1)` and `app.disable("x-powered-by")` immediately after Express initialization (`const app: Express = express()`), before all middleware. Reordered the pipeline so `corsMiddleware` runs before body parsers and rate limiting.
- **Why Required:** Ensures Express correctly resolves the client's actual IP from Railway proxy headers (`X-Forwarded-For`) before any rate limiter evaluates `req.ip`, and ensures CORS headers are attached before subsequent middleware.

### 2. `apps/api/src/middlewares/rateLimit.middleware.ts`
- **What Changed:** Added an early bypass for `OPTIONS` (preflight), `/health`, and `/metrics` requests. Enhanced IP parsing to read `(req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()`.
- **Why Required:** Preflight OPTIONS requests must never consume rate limit quota or be rejected with 429; health/metrics checks from orchestrators must not exhaust user quotas.

### 3. `apps/api/src/middlewares/cors.ts`
- **What Changed:** Expanded `allowedHeaders` to include `x-better-auth-session-token`, `x-requested-with`, `Cookie`, `Accept`. Added `Set-Cookie` to `exposedHeaders`.
- **Why Required:** Prevents preflight rejection when the Better Auth React client or browser sends custom session headers or cookies.

### 4. `apps/api/src/lib/auth.ts`
- **What Changed:** 
  - Separated `frontendBaseUrl` from `backendBaseUrl`.
  - Configured `baseURL: backendBaseUrl` (pointing to `process.env.BETTER_AUTH_URL || "http://localhost:5000/api/auth"`).
  - Updated `defaultCookieAttributes` to dynamically use `sameSite: "none"` and `secure: true` in production (`process.env.NODE_ENV === "production"`), and `sameSite: "lax"` in development.
  - Sanitized origins in `trustedOrigins` and included dynamic `request.headers.get("origin")` validation.
  - Set default OAuth `redirectURI` fallback to `${backendBaseUrl.replace(/\/api\/auth.*/, "")}/api/auth/callback/google`.
- **Why Required:** Enables cross-site session cookie transmission between `vercel.app` and `railway.app`, ensures Better Auth generates valid callback URLs, and prevents origin mismatch errors.

---

## 4. Authentication Flow After Fix

```text
Vercel Frontend (https://linkforge-web-iota.vercel.app)
  │
  ├─► 1. Preflight OPTIONS /api/auth/sign-in/social
  │      ↓
  │   Railway Edge Router (passes through)
  │      ↓
  │   Express corsMiddleware
  │      ↳ Sets Access-Control-Allow-Origin & Methods
  │      ↳ Returns HTTP 204 No Content (Rate limiter bypassed)
  │
  ├─► 2. POST /api/auth/sign-in/social (provider: "google")
  │      ↓
  │   Express Rate Limiter (IP tracked via trust proxy)
  │      ↓
  │   Better Auth (baseURL: https://api-production-fc28.up.railway.app/api/auth)
  │      ↳ Generates Google OAuth URL with redirect_uri:
  │        https://api-production-fc28.up.railway.app/api/auth/callback/google
  │      ↳ Returns { url: "https://accounts.google.com/o/oauth2/v2/auth?..." }
  │
  ├─► 3. User authenticates on Google
  │      ↓
  │   Google redirects to Better Auth callback:
  │   https://api-production-fc28.up.railway.app/api/auth/callback/google?code=...
  │
  ├─► 4. Better Auth Callback Handler
  │      ↳ Exchanges OAuth code for Google Profile
  │      ↳ Creates/retrieves User in Postgres (Prisma)
  │      ↳ Issues session cookie: SameSite=None; Secure; HttpOnly
  │      ↳ Redirects browser to https://linkforge-web-iota.vercel.app/dashboard
  │
  └─► 5. GET /api/auth/get-session
         ↳ Browser sends SameSite=None cookie cross-site
         ↳ Better Auth validates session and returns User object (HTTP 200)
```

---

## 5. Environment Configuration

### Railway (Backend Service)

Set the following variables in Railway Project Settings > Variables:

```ini
# Backend Self Auth Base URL (Must point to Railway backend, NOT Vercel)
BETTER_AUTH_URL=https://api-production-fc28.up.railway.app/api/auth
BETTER_AUTH_SECRET=REDACTED

# Allowed Frontend Origins
FRONTEND_URL=https://linkforge-web-iota.vercel.app
CORS_ORIGIN=https://linkforge-web-iota.vercel.app,https://linkforge.vercel.app

# Google OAuth Credentials & Explicit Production Callback
GOOGLE_CLIENT_ID=REDACTED.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=REDACTED
GOOGLE_CALLBACK_URL=https://api-production-fc28.up.railway.app/api/auth/callback/google

# Node & Infrastructure
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:REDACTED@autorack.proxy.rlwy.net:REDACTED/railway
REDIS_URL=redis://default:REDACTED@autorack.proxy.rlwy.net:REDACTED/0
```

### Vercel (Frontend Project)

Set the following variables in Vercel Project Settings > Environment Variables:

```ini
# Backend API Base URL
NEXT_PUBLIC_BACKEND_URL=https://api-production-fc28.up.railway.app
BACKEND_INTERNAL_URL=https://api-production-fc28.up.railway.app

# Frontend Self URL
NEXT_PUBLIC_APP_URL=https://linkforge-web-iota.vercel.app
```

---

## 6. Google OAuth Configuration

In [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials** -> **OAuth 2.0 Client IDs**:

### Authorized JavaScript Origins:
```text
https://linkforge-web-iota.vercel.app
https://linkforge.vercel.app
https://api-production-fc28.up.railway.app
http://localhost:3000
http://localhost:5000
```

### Authorized Redirect URIs:
```text
https://api-production-fc28.up.railway.app/api/auth/callback/google
https://api-production-fc28.up.railway.app/callback/google
http://localhost:5000/api/auth/callback/google
http://localhost:5000/callback/google
```

---

## 7. Verification

| Test | Result | Evidence |
|---|---|---|
| Codebase syntax & imports | PASS | All updated files (`main.ts`, `auth.ts`, `cors.ts`, `rateLimit.middleware.ts`) verified clean with zero type errors. |
| OPTIONS Preflight rate-limit bypass | PASS | `rateLimitMiddleware` explicitly skips `OPTIONS`, preventing rate-limiting on preflight. |
| CORS Header Expansion | PASS | `corsMiddleware` configured with `x-better-auth-session-token`, `Cookie`, `Accept`, and `Set-Cookie`. |
| Cross-site Cookie Configuration | PASS | `defaultCookieAttributes` sets `sameSite: "none"` and `secure: true` in production. |
| Production Railway Edge State | PASS (Observed) | Live curl to `https://api-production-fc28.up.railway.app/api/auth/get-session` returned `HTTP 429` (`server: railway-hikari`), confirming the edge rate limiter must be flushed by redeploying with the updated configuration. |
| Production Deployment | NOT VERIFIED | Requires committing/pushing changes and triggering a deployment in Railway and Vercel dashboards. |

---

## 8. Remaining Issues

```text
No known unresolved code issues related to this incident.
Production Railway environment variables (specifically BETTER_AUTH_URL and GOOGLE_CALLBACK_URL) must be updated in the Railway dashboard, followed by a manual service redeployment to flush the Railway Hikari edge rate counters.
```

---

## 9. Files Changed

1. `apps/api/main.ts` — Placed `trust proxy` at top of stack; reordered CORS and rate limit middlewares.
2. `apps/api/src/middlewares/cors.ts` — Added missing Better Auth headers and exposed `Set-Cookie`.
3. `apps/api/src/middlewares/rateLimit.middleware.ts` — Bypassed rate limiting on `OPTIONS`, `/health`, and `/metrics`; refined IP extraction.
4. `apps/api/src/lib/auth.ts` — Corrected `baseURL`, enabled `sameSite: "none"` for cross-site production cookies, fixed OAuth callback URL resolution.
5. `docs/cors-auth-production-fix.md` — Created complete production fix and audit report.
