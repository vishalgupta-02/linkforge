# Security & Production Safety Audit

> **Target:** LinkForge Monorepo (`apps/api`, `apps/web`, `packages/types`)  
> **Audit Type:** Full Production Security, Reliability, Privacy, Trust & Safety Audit  
> **Auditor Perspective:** Senior Principal Application Security & Infrastructure Architect  
> **Status:** Completed — Codebase Frozen (Inspection & Analysis Only)  

---

## Executive Summary

A comprehensive architectural and static code audit was conducted on the LinkForge production codebase. The platform demonstrates strong modern engineering practices in several domains, including asynchronous event ingestion via BullMQ, cryptographic password-reset token hashing with constant-time non-enumeration paths, distributed tracing with OpenTelemetry, and strict transactional data updates in PostgreSQL.

However, the audit revealed **Critical and High-severity security vulnerabilities, authorization gaps, unauthenticated administration routes, memory exhaustion attack vectors, and reliability risks** that must be resolved prior to enterprise production deployment.

### Summary of Key Findings
- **Critical (CRIT-01):** Unauthenticated BOLA / IDOR endpoint (`POST /api/v1/users/user/me`) exposes private user details (including email addresses and subscription plan status) to any attacker supplying a victim's `userId`.
- **Critical (CRIT-02):** Unauthenticated Admin Queue Dashboard (`/admin/queues`) mounts the full BullMQ UI with zero authentication or authorization, allowing anyone on the public internet to inspect, pause, retry, or wipe all system queues (including click events and transactional emails).
- **High (HIGH-01):** Unauthenticated Failed Jobs API (`GET /api/v1/admin/failed-jobs`) leaks raw failed job payloads containing user IDs, link IDs, IP addresses, and User-Agents.
- **High (HIGH-02):** Overly Permissive CORS Configuration (`cors.ts`) allows any subdomain matching `https://*.vercel.app` with `credentials: true`, enabling malicious third-party Vercel apps to execute authenticated cross-origin requests using victim browser cookies.
- **High (HIGH-03):** Global Rate Limiting Misconfiguration & Process-Memory State: `rateLimitMiddleware` executes in `main.ts` prior to session authentication, applying global IP rate limiting to all authenticated users. Furthermore, it uses `RateLimiterMemory`, making rate limits non-shared across horizontally scaled container instances.
- **High (HIGH-04):** Denial of Service via Unbounded Redis Key Scanning (`getLiveVisitorCount`): Every 5 seconds per connected SSE administrator, `redis.scan` iterates over the entire Redis keyspace matching `live:visitor:<userId>:*`, creating extreme Redis CPU saturation under high key cardinality.
- **Medium (MED-01):** Memory Buffer Heap Exhaustion in File Uploads (`upload.routes.ts`): Multer uses `memoryStorage()`, allowing concurrent large multipart uploads to exhaust Node.js heap memory before reaching Cloudinary.

---

## Application Attack Surface

```
                                  PUBLIC INTERNET
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
         [apps/web (Next.js 16)]                         [apps/api (Express 5)]
        - / (Landing Page)                              - /health (Public)
        - /login, /signup (Auth)                        - /metrics (Prometheus Scrape - Public)
        - /forgot-password, /reset-password             - /admin/queues (Bull Board - UNPROTECTED!)
        - /dashboard/* (Auth Required)                  - /api/auth/* (Better-Auth Routes)
        - /username/[username] (Public Bio)             - /api/v1/r/:id (Public Redirect & Ingestion)
                                                        - /api/v1/users/public/:username (Public)
                                                        - /api/v1/users/user/me (UNPROTECTED IDOR!)
                                                        - /api/v1/admin/failed-jobs (UNPROTECTED!)
                                                        - /api/v1/billing/webhook (Stripe Raw Buffer)
                                                        - /api/v1/live/:username/* (Visitor Heartbeat)
```

### Access Levels & Privileges
1. **Unauthenticated Attacker**:
   - Can access public profile landing pages (`/username/:username`, `/api/v1/links/profile/:username/links`).
   - Can trigger public link redirects (`GET /api/v1/r/:id`), which enqueues click events into BullMQ.
   - Can access the unauthenticated BullMQ Dashboard (`/admin/queues`) and Admin Failed Jobs API (`/api/v1/admin/failed-jobs`).
   - Can exploit `POST /api/v1/users/user/me` with arbitrary `userId` values to harvest private emails and account metadata.
   - Can scrape internal metrics (`/metrics`).
2. **Authenticated Creator (`FREE` Plan)**:
   - Can perform full CRUD on owned links (`/api/v1/links/*`), update profile, and change username.
   - Cannot access Pro features (`/api/v1/live/:username/stream`, extended 90d analytics) — blocked by `requirePro` middleware.
3. **Authenticated Creator (`PRO` Plan)**:
   - Can establish real-time Server-Sent Events (SSE) live visitor streams (`GET /api/v1/live/:username/stream`).
   - Can access Pro analytics aggregation intervals.

---

## Critical Findings

### [CRIT-01] Unauthenticated BOLA / IDOR on User Profile Lookup
- **Vulnerability Type:** Broken Object Level Authorization (BOLA / IDOR) / Information Disclosure
- **Location:** [`apps/api/src/routes/v1/user.routes.ts:15`](file:///d:/linkforge/apps/api/src/routes/v1/user.routes.ts#L15), [`apps/api/src/controllers/user/profile.controller.ts:74-92`](file:///d:/linkforge/apps/api/src/controllers/user/profile.controller.ts#L74-L92)
- **Evidence:**
  ```ts
  // routes/v1/user.routes.ts:15
  router.post("/user/me", getUsernameController); // Notice missing protectedRoute!

  // controllers/user/profile.controller.ts:74
  export const getUsernameController = async (req: Request, res: Response) => {
    const { userId } = req.body; // Client-controlled userId from request body
    if (!userId) throw new AppError("Unauthorized", 401);
    const profile = await getPublicProfileByUserId(userId);
    return res.json(ApiResponse(profile, "Username fetched successfully", 200));
  };
  ```
- **Exploitation Scenario:**
  An unauthenticated external attacker sends:
  ```http
  POST /api/v1/users/user/me HTTP/1.1
  Host: api.linkforge.bio
  Content-Type: application/json

  { "userId": "target-user-uuid" }
  ```
  The server responds with the target user's private record:
  ```json
  {
    "data": {
      "id": "target-user-uuid",
      "name": "Jane Doe",
      "userName": "janedoe",
      "email": "jane.doe@private-corp.com",
      "plan": "PRO",
      "bio": "Confidential creator bio",
      "image": "https://res.cloudinary.com/..."
    }
  }
  ```
- **Impact:** Complete leakage of user email addresses, real names, internal plan statuses, and account existence across all registered users.
- **Recommended Fix:** Attach `protectedRoute` middleware to `POST /user/me` (or change to `GET /me`) and use `req.user.id` strictly rather than reading `userId` from `req.body`.

---

### [CRIT-02] Unauthenticated BullMQ Administration Dashboard Exposure
- **Vulnerability Type:** Missing Authentication / Administrative Access Exposure
- **Location:** [`apps/api/main.ts:146`](file:///d:/linkforge/apps/api/main.ts#L146)
- **Evidence:**
  ```ts
  // main.ts:146
  // 🔥 Bull Board UI
  app.use("/admin/queues", serverAdapter.getRouter());
  ```
- **Exploitation Scenario:**
  An external attacker navigates directly to `https://api.linkforge.bio/admin/queues` in any web browser. The Bull Board administrative interface renders with full control:
  1. Attacker views all active, waiting, and failed jobs in `click-tracking` and `email-queue`.
  2. Attacker inspects job data payloads containing user email addresses, password reset URLs, and tracking IP addresses.
  3. Attacker clicks "Clean All" or "Pause Queue" to halt system-wide email dispatch and click event ingestion.
- **Impact:** High-severity privacy leakage (PII/tokens in job data) and complete denial of service / queue sabotage.
- **Recommended Fix:** Wrap `/admin/queues` with `protectedRoute` and an explicit administrative role guard (`requireAdmin` or HTTP Basic Auth secret).

---

## High Findings

### [HIGH-01] Unauthenticated Failed Background Jobs Data Exposure
- **Vulnerability Type:** Information Disclosure / Missing Authorization
- **Location:** [`apps/api/src/routes/v1/admin.routes.ts:7`](file:///d:/linkforge/apps/api/src/routes/v1/admin.routes.ts#L7), [`apps/api/src/services/admin.service.ts:3-21`](file:///d:/linkforge/apps/api/src/services/admin.service.ts#L3-L21)
- **Evidence:**
  ```ts
  // admin.routes.ts
  router.get("/failed-jobs", failedJobsController); // No middleware!

  // admin.service.ts
  export const getFailedJobs = async () => {
    const failedJobs = await clickQueue.getFailed();
    return failedJobs.map((job) => ({ id: job.id, data: job.data, failedReason: job.failedReason }));
  };
  ```
- **Impact:** Unauthenticated actors can extract raw failed click payloads containing internal user IDs, IP addresses, and User-Agent fingerprints.
- **Recommended Fix:** Require `protectedRoute` and verify administrative authorization.

---

### [HIGH-02] Insecure CORS Regex Permitting Arbitrary Vercel Deployments
- **Vulnerability Type:** Cross-Origin Resource Sharing (CORS) Misconfiguration
- **Location:** [`apps/api/src/middlewares/cors.ts:26-33`](file:///d:/linkforge/apps/api/src/middlewares/cors.ts#L26-L33)
- **Evidence:**
  ```ts
  if (
    allowed.includes(origin) ||
    /^https:\/\/.*\.vercel\.app$/.test(origin) // Allows ALL Vercel apps!
  ) {
    return callback(null, true);
  }
  ```
- **Exploitation Scenario:**
  An attacker deploys a malicious website to `https://attacker-exploit.vercel.app`. When a logged-in LinkForge user visits the attacker's page, JavaScript on the page executes `fetch("https://api.linkforge.bio/api/v1/links/create", { credentials: "include", ... })`. Because the regex matches any `.vercel.app` origin and `credentials: true` is configured, the browser includes LinkForge session cookies, allowing the attacker to perform authenticated actions on behalf of the victim.
- **Impact:** Cross-Site Request Forgery / Cross-Origin Account Takeover from any Vercel domain.
- **Recommended Fix:** Restrict the regex to your specific production/staging project domains (e.g. `/^https:\/\/linkforge(-[a-z0-9]+)?\.vercel\.app$/`) or populate explicitly via environment variable whitelist.

---

### [HIGH-03] Process-Memory Rate Limiter & Pre-Auth Global IP Collision
- **Vulnerability Type:** Security Misconfiguration / Distributed State Flaw
- **Location:** [`apps/api/main.ts:48`](file:///d:/linkforge/apps/api/main.ts#L48), [`apps/api/src/middlewares/rateLimit.ts:5-14`](file:///d:/linkforge/apps/api/src/middlewares/rateLimit.ts#L5-L14)
- **Evidence:**
  ```ts
  // main.ts:48
  app.use(rateLimitMiddleware); // Invoked before Better-Auth session middleware!

  // middlewares/rateLimit.ts
  export const publicRateLimiter = new RateLimiterMemory({ points: 100, duration: 60 });
  ```
- **Impact:**
  1. In multi-container deployments, rate limits are held in Node.js heap memory per process and not synchronized via Redis, allowing an attacker to bypass rate limits by distributing requests across containers.
  2. Because `rateLimitMiddleware` runs before session extraction, `req.user` is always `undefined`, causing all authenticated creators behind shared IP addresses (offices, universities) to share the strict 100 req/min public limit.
- **Recommended Fix:** Refactor to `RateLimiterRedis` using the existing Redis client singleton and position the middleware after session resolution.

---

### [HIGH-04] Denial of Service via Redis Full Keyspace Scanning (`redis.scan`)
- **Vulnerability Type:** Algorithmic Complexity Denial of Service
- **Location:** [`apps/api/src/services/live.service.ts:29-57`](file:///d:/linkforge/apps/api/src/services/live.service.ts#L29-L57)
- **Evidence:**
  ```ts
  const scanKeys = async (pattern: string): Promise<string[]> => {
    let cursor = "0";
    do {
      const [nextCursor, foundKeys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      keys.push(...foundKeys);
    } while (cursor !== "0");
    return keys;
  };

  export const getLiveVisitorCount = async (userId: string) => {
    return (await scanKeys(CACHE_KEYS.liveVisitorPattern(userId))).length;
  };
  ```
- **Impact:** The SSE live visitor controller runs `getLiveVisitorCount` every 5 seconds for every active Pro dashboard viewer. In a Redis database with 500k+ keys, running multiple simultaneous `SCAN` loops consumes excessive Redis single-threaded CPU, stalling all application cache and queue operations.
- **Recommended Fix:** Replace individual keys with a Redis Sorted Set (`ZSET`) per user (where member is `sessionId` and score is `expireTimestamp`). Expire old visitors with `ZREMRANGEBYSCORE` and fetch count in $O(1)$ via `ZCARD`.

---

## Medium Findings

### [MED-01] Multipart Upload Memory Buffer Heap Pressure
- **Location:** [`apps/api/src/middlewares/upload.middleware.ts:6`](file:///d:/linkforge/apps/api/src/middlewares/upload.middleware.ts#L6)
- **Detail:** Multer stores incoming avatar images in RAM (`multer.memoryStorage()`). Multiple concurrent large file uploads could trigger Node.js V8 heap out-of-memory crashes.
- **Remediation:** Enforce a strict 2MB file size limit in Multer and pipe streams directly to Cloudinary.

### [MED-02] Public Click Redirect Lack of Destination Protocol Validation
- **Location:** [`apps/api/src/controllers/click-event/click-event.controller.ts:36`](file:///d:/linkforge/apps/api/src/controllers/click-event/click-event.controller.ts#L36)
- **Detail:** `redirectController` issues `res.redirect(302, link.url)`. While Zod checks `z.string().url()`, it allows non-HTTP protocols or internal network addresses (e.g. `file://`, `ftp://`).
- **Remediation:** Enforce protocol validation to only allow `http:` and `https:`.

### [MED-03] Missing Rate Limiting on Authentication & Reset Endpoints
- **Location:** [`apps/api/src/routes/v1/auth.routes.ts`](file:///d:/linkforge/apps/api/src/routes/v1/auth.routes.ts)
- **Detail:** `POST /forgot-password` and `POST /reset-password` do not have dedicated strict rate limiters (e.g., 5 requests per 15 minutes per IP/email), allowing potential email dispatch flooding.
- **Remediation:** Apply a dedicated Redis rate limiter on `/forgot-password`.

---

## Low Findings

### [LOW-01] Internal Database UUID Exposure in Public Analytics & Redirects
- **Location:** Link URLs use internal database UUIDs (e.g. `/api/v1/r/d3b07384d113...`).
- **Assessment:** Not an IDOR vulnerability because link redirects are publicly intended resources. However, adopting short opaque slugs (e.g. `lnk_8f9x2`) obscures internal database ID formats.

### [LOW-02] Public Prometheus Metrics Endpoint
- **Location:** [`apps/api/main.ts:135`](file:///d:/linkforge/apps/api/main.ts#L135)
- **Detail:** `GET /metrics` exposes raw traffic volume, database connection stats, and signup metrics to anyone who queries the API port.
- **Remediation:** Restrict `/metrics` to private Docker networks or require a bearer token.

---

## Security Domain Deep-Dives

### 1. Authentication
- **Registration & Passwords:** Uses `better-auth` with bcrypt password hashing and Prisma database adapters.
- **Password Reset:** Generates 32-byte cryptographically secure random tokens (`crypto.randomBytes(32)`), stores SHA-256 hashes in `password_reset_token` with 1-hour expiration, and invalidates previously issued active tokens upon new requests. Employs constant-time dummy hashing when emails are not found to prevent user enumeration.
- **Session Tokens:** `httpOnly`, `secure` (in production), `sameSite: "lax"`.

### 2. Authorization / IDOR / BOLA
- **Link Management:** All link mutations (`updateLink`, `deleteLink`, `toggleLink`, `reorderLinks`) explicitly query `where: { id, userId }` ensuring User A cannot modify User B's resources.
- **Exception:** `POST /api/v1/users/user/me` (detailed in CRIT-01).

### 3. Database Security & Concurrency
- **Transaction Safety:** Link reordering uses atomic `prisma.$transaction`.
- **Milestone Race Prevention:** Unique compound index `@@unique([userId, milestone])` on `click_milestone` prevents race-conditioned duplicate reward emails.

### 4. Webhook Security
- **Stripe Signature Verification:** Verified against raw buffer (`express.raw`) using `stripe.webhooks.constructEvent`.
- **Idempotency:** Webhook event IDs are tracked in `stripe_webhook_event` table to prevent replay attacks.

---

## Attack Scenarios & Codebase Defense Status

| Scenario | Description | Codebase Status | Analysis |
| :--- | :--- | :--- | :--- |
| **1. IDOR on Link Update** | Attacker calls `PATCH /api/v1/links/update/:id` with another user's `linkId`. | **BLOCKS IT** | `updateLink` checks `link.userId !== userId` and throws `403 Forbidden`. |
| **2. BOLA on Profile Query** | Attacker calls `POST /api/v1/users/user/me` with victim `userId`. | **IS VULNERABLE** | Route is unauthenticated and reads `userId` from body (CRIT-01). |
| **3. Administrative Queue Hijack** | Attacker navigates to `/admin/queues`. | **IS VULNERABLE** | Bull Board router is mounted without middleware (CRIT-02). |
| **4. CORS Cookie Theft** | Attacker hosts script on `evil.vercel.app` calling API. | **IS VULNERABLE** | CORS regex allows all `*.vercel.app` with credentials (HIGH-02). |
| **5. Password Reset Timing Attack** | Attacker enumerates registered emails via response timing. | **BLOCKS IT** | Service generates dummy token and hash on missing users to equalize latency. |
| **6. Stripe Webhook Replay** | Attacker resends captured Stripe webhook payload. | **BLOCKS IT** | Replayed event ID is caught in `stripe_webhook_event` and rejected. |
| **7. Malicious Touch Hijack** | Mobile user scrolling page accidentally drags a link. | **BLOCKS IT** | Drag handle enforces `touch-action: none` / `touch-none` strictly on grab button. |

---

## Security Scorecard

| Category | Score (0-10) | Primary Justification |
| :--- | :---: | :--- |
| **Authentication** | **9.0 / 10** | Strong password hashing, secure token hashing, anti-enumeration logic. |
| **Authorization / BOLA** | **6.5 / 10** | Solid link ownership checks; severely impacted by CRIT-01 on user endpoint. |
| **API Security** | **6.0 / 10** | Unprotected admin endpoints (CRIT-02, HIGH-01) and permissive CORS (HIGH-02). |
| **Database Security** | **9.0 / 10** | Parameterized Prisma queries, compound unique indexes, atomic transactions. |
| **Frontend Security** | **9.0 / 10** | No `dangerouslySetInnerHTML`, safe React rendering, sanitization. |
| **Rate Limiting** | **6.0 / 10** | Memory-based rate limiter instead of Redis; pre-auth execution. |
| **Observability** | **9.5 / 10** | Outstanding OpenTelemetry, Prometheus, Sentry, and Pino integration. |
| **Data Integrity** | **9.0 / 10** | Idempotent webhooks, soft deletions, transactional batching. |

---

## Prioritized Remediation Plan

### Phase P0: Critical Security Fixes (Immediate)
1. **Fix BOLA on `POST /api/v1/users/user/me`**: Attach `protectedRoute` and bind user lookup strictly to `req.user.id`.
2. **Secure `/admin/queues` and `/api/v1/admin/failed-jobs`**: Apply `protectedRoute` and enforce administrative role authorization.
3. **Restrict CORS Vercel Origin Regex**: Replace wildcard `*.vercel.app` with specific environment-configured domain whitelist.

### Phase P1: High-Priority Reliability & Abuse Protections
4. **Migrate Rate Limiting to Redis**: Convert `RateLimiterMemory` to `RateLimiterRedis` and move middleware post-session resolution.
5. **Refactor Live Visitors to Redis Sorted Sets**: Eliminate `redis.scan` in `live.service.ts` in favor of $O(1)$ `ZSET` operations.
6. **Add Strict Protocol Validation on Redirects**: Restrict redirect targets to `http:` and `https:`.

### Phase P2: Medium Hardening
7. **Stream Cloudinary Uploads**: Replace Multer memory buffer storage with direct stream piping.
8. **Add Dedicated Rate Limiting to Reset Endpoints**: Limit `POST /forgot-password` to 5 req/15min.

---

## Final Assessment

LinkForge has an exceptionally well-engineered foundational architecture with high test coverage, robust database constraints, and modern telemetry. However, **CRIT-01, CRIT-02, HIGH-01, and HIGH-02 represent immediate attack vectors that must be remediated prior to exposing the API to public production traffic.** All findings are fully actionable with straightforward fixes.
