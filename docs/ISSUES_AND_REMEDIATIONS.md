# LinkForge: Complete Security Issues & Code Remediation Blueprint

> **Companion Document:** To be used alongside [`SECURITY-AUDIT.md`](file:///d:/linkforge/SECURITY-AUDIT.md)  
> **Status:** Code Remediation Specifications (Pending User Implementation Approval)  

---

# Index of Issues

| ID | Title | Severity | Component / File | Fix Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Unauthenticated BOLA on User Profile (`POST /api/v1/users/user/me`) | **CRITICAL** | `apps/api/src/routes/v1/user.routes.ts` | 15 mins |
| **SEC-02** | Unprotected BullMQ Admin Queue Dashboard (`/admin/queues`) | **CRITICAL** | `apps/api/main.ts` | 20 mins |
| **SEC-03** | Unprotected Failed Jobs Admin API (`GET /api/v1/admin/failed-jobs`) | **HIGH** | `apps/api/src/routes/v1/admin.routes.ts` | 10 mins |
| **SEC-04** | Overly Permissive Wildcard Vercel Origin in CORS Configuration | **HIGH** | `apps/api/src/middlewares/cors.ts` | 15 mins |
| **SEC-05** | In-Memory Rate Limiting & Pre-Auth Execution | **HIGH** | `apps/api/src/middlewares/rateLimit.ts` & `main.ts` | 30 mins |
| **SEC-06** | DoS via Unbounded Redis Full Keyspace Scanning in Live Visitors | **HIGH** | `apps/api/src/services/live.service.ts` | 45 mins |
| **SEC-07** | Multer In-Memory Storage Heap Pressure on Avatar Uploads | **MEDIUM** | `apps/api/src/middlewares/upload.middleware.ts` | 25 mins |
| **SEC-08** | Missing Destination Protocol Validation on Link Redirection | **MEDIUM** | `apps/api/src/validators/link.validator.ts` | 15 mins |
| **SEC-09** | Missing Dedicated Rate Limiter on Password Reset Endpoint | **MEDIUM** | `apps/api/src/routes/v1/auth.routes.ts` | 20 mins |
| **SEC-10** | Public Exposure of Prometheus Telemetry Metrics Scrape Route | **LOW** | `apps/api/main.ts` | 15 mins |

---

## Detailed Issue Analysis & Remediation Blueprints

---

### Issue SEC-01: Unauthenticated BOLA on User Profile Lookup
- **Severity:** `CRITICAL`
- **CVSS v3.1 Score:** 8.6 (High / Critical) — `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`
- **Location:** 
  - [`apps/api/src/routes/v1/user.routes.ts:15`](file:///d:/linkforge/apps/api/src/routes/v1/user.routes.ts#L15)
  - [`apps/api/src/controllers/user/profile.controller.ts:74-92`](file:///d:/linkforge/apps/api/src/controllers/user/profile.controller.ts#L74-L92)
- **Vulnerability Explanation:**
  The route `POST /api/v1/users/user/me` was exposed without the `protectedRoute` middleware. The controller extracts `userId` directly from `req.body.userId` and invokes `getPublicProfileByUserId(userId)`. This function returns internal user fields (`id`, `name`, `userName`, `plan`, `bio`, `image`, `email`). Any unauthenticated external client can submit arbitrary `userId` UUIDs and extract private emails, real names, and subscription tiers.

#### Code Remediation:
1. In `apps/api/src/routes/v1/user.routes.ts`:
```diff
- router.post("/user/me", getUsernameController);
+ router.get("/me", protectedRoute, getUsernameController);
```

2. In `apps/api/src/controllers/user/profile.controller.ts`:
```diff
export const getUsernameController = async (req: Request, res: Response) => {
-  const { userId } = req.body;
-  if (!userId) {
-    throw new AppError("Unauthorized", 401);
-  }
+  const userId = req.user?.id;
+  if (!userId) {
+    throw new AppError("Unauthorized", 401);
+  }

  const profile = await getPublicProfileByUserId(userId);
  if (!profile) {
    return res.json(ApiResponse(null, "User not found", 404));
  }

  const response = ApiResponse(profile, "User profile fetched successfully", 200);
  return res.json(response);
};
```

---

### Issue SEC-02: Unprotected BullMQ Admin Queue Dashboard
- **Severity:** `CRITICAL`
- **CVSS v3.1 Score:** 9.1 (Critical) — `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`
- **Location:** [`apps/api/main.ts:146`](file:///d:/linkforge/apps/api/main.ts#L146)
- **Vulnerability Explanation:**
  The BullMQ admin dashboard (`serverAdapter.getRouter()`) is mounted directly on `/admin/queues` with zero authentication. Anyone on the public internet can view active queues, view job payloads containing user emails and tracking IPs, pause queues, and delete/retry jobs.

#### Code Remediation:
In `apps/api/main.ts`:
```diff
+ import { adminAuthMiddleware } from "./src/middlewares/admin-auth.middleware.ts";

- // 🔥 Bull Board UI
- app.use("/admin/queues", serverAdapter.getRouter());
+ // 🔥 Bull Board UI (Protected by Admin Auth)
+ app.use("/admin/queues", adminAuthMiddleware, serverAdapter.getRouter());
```

Create `apps/api/src/middlewares/admin-auth.middleware.ts`:
```ts
import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.ts";
import { AppError } from "../utils/api-error.ts";

export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Option A: Session-based admin check
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());

  if (session?.user?.email && adminEmails.includes(session.user.email.toLowerCase())) {
    return next();
  }

  // Option B: Basic Auth for server administrators
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_SECRET_KEY;

  if (adminSecret && authHeader === `Bearer ${adminSecret}`) {
    return next();
  }

  throw new AppError("Forbidden: Admin access required", 403);
};
```

---

### Issue SEC-03: Unprotected Failed Jobs Admin API
- **Severity:** `HIGH`
- **Location:** [`apps/api/src/routes/v1/admin.routes.ts:7`](file:///d:/linkforge/apps/api/src/routes/v1/admin.routes.ts#L7)
- **Vulnerability Explanation:**
  `GET /api/v1/admin/failed-jobs` returns all failed queue jobs without verifying whether the request is from an authenticated administrator.

#### Code Remediation:
In `apps/api/src/routes/v1/admin.routes.ts`:
```diff
import { Router } from "express";
import { failedJobsController } from "../../controllers/admin/admin.controller.ts";
+ import { protectedRoute } from "../../middlewares/protected-routes.middleware.ts";
+ import { adminAuthMiddleware } from "../../middlewares/admin-auth.middleware.ts";

const router: Router = Router();

- router.get("/failed-jobs", failedJobsController);
+ router.get("/failed-jobs", protectedRoute, adminAuthMiddleware, failedJobsController);

export default router;
```

---

### Issue SEC-04: Overly Permissive Wildcard Vercel Origin in CORS Configuration
- **Severity:** `HIGH`
- **Location:** [`apps/api/src/middlewares/cors.ts:28`](file:///d:/linkforge/apps/api/src/middlewares/cors.ts#L28)
- **Vulnerability Explanation:**
  The regex `/^https:\/\/.*\.vercel\.app$/.test(origin)` combined with `credentials: true` allows any site hosted on Vercel to issue authenticated requests using victim cookies.

#### Code Remediation:
In `apps/api/src/middlewares/cors.ts`:
```diff
const getAllowedOrigins = (): string[] => {
  const origins = ["http://localhost:3000"];
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
  }
  if (process.env.CORS_ORIGIN) {
    process.env.CORS_ORIGIN.split(",").forEach((o) => {
      const trimmed = o.trim().replace(/\/$/, "");
      if (trimmed && !origins.includes(trimmed)) {
        origins.push(trimmed);
      }
    });
  }
  return origins;
};

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowed = getAllowedOrigins();
-   if (
-     allowed.includes(origin) ||
-     /^https:\/\/.*\.vercel\.app$/.test(origin)
-   ) {
-     return callback(null, true);
-   }
+   const isAllowed =
+     allowed.includes(origin) ||
+     /^https:\/\/linkforge(-[a-zA-Z0-9_-]+)?\.vercel\.app$/.test(origin);
+
+   if (isAllowed) {
+     return callback(null, true);
+   }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  ...
});
```

---

### Issue SEC-05: In-Memory Rate Limiting & Pre-Auth Execution
- **Severity:** `HIGH`
- **Location:** [`apps/api/src/middlewares/rateLimit.ts`](file:///d:/linkforge/apps/api/src/middlewares/rateLimit.ts) and [`apps/api/main.ts:48`](file:///d:/linkforge/apps/api/main.ts#L48)
- **Vulnerability Explanation:**
  1. `RateLimiterMemory` stores rate limits in local process memory, which is bypassed when scaling across multiple Docker containers.
  2. In `main.ts`, the rate limiter runs prior to session middleware, treating all requests as unauthenticated.

#### Code Remediation:
In `apps/api/src/middlewares/rateLimit.ts`:
```ts
import { RateLimiterRedis } from "rate-limiter-flexible";
import { redis } from "../lib/redis.ts";

export const publicRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl:public",
  points: 100, // 100 requests
  duration: 60, // per 60 seconds
});

export const authRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl:auth",
  points: 1000,
  duration: 60,
});
```

---

### Issue SEC-06: DoS via Unbounded Redis Full Keyspace Scanning in Live Visitors
- **Severity:** `HIGH`
- **Location:** [`apps/api/src/services/live.service.ts:29-57`](file:///d:/linkforge/apps/api/src/services/live.service.ts#L29-L57)
- **Vulnerability Explanation:**
  `getLiveVisitorCount` iterates over all Redis keys using `SCAN MATCH live:visitor:<userId>:*` every 5 seconds per SSE connection.

#### Code Remediation:
In `apps/api/src/services/live.service.ts`:
```ts
import { redis } from "../lib/redis.ts";
import { LIVE_VISITOR_TTL } from "../lib/cache-keys.ts";

const getZSetKey = (userId: string) => `live:zset:${userId}`;

export const createLiveVisitor = async (userId: string, sessionId: string) => {
  const now = Date.now();
  const expireAt = now + LIVE_VISITOR_TTL * 1000;
  const key = getZSetKey(userId);

  await redis.zadd(key, expireAt, sessionId);
  await redis.expire(key, LIVE_VISITOR_TTL * 2);
};

export const refreshLiveVisitor = async (userId: string, sessionId: string) => {
  await createLiveVisitor(userId, sessionId);
};

export const removeLiveVisitor = async (userId: string, sessionId: string) => {
  const key = getZSetKey(userId);
  await redis.zrem(key, sessionId);
};

export const getLiveVisitorCount = async (userId: string) => {
  const now = Date.now();
  const key = getZSetKey(userId);

  // Remove expired visitors in O(log(N) + M)
  await redis.zremrangebyscore(key, "-inf", now);

  // Return live count in O(1)
  return await redis.zcard(key);
};
```

---

### Issue SEC-07: Multer In-Memory Storage Heap Pressure on Avatar Uploads
- **Severity:** `MEDIUM`
- **Location:** [`apps/api/src/middlewares/upload.middleware.ts`](file:///d:/linkforge/apps/api/src/middlewares/upload.middleware.ts)
- **Vulnerability Explanation:**
  Uncapped memory buffer usage during multipart uploads.

#### Code Remediation:
In `apps/api/src/middlewares/upload.middleware.ts`:
```ts
import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB strict maximum
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WEBP, and GIF images are allowed."));
    }
  },
});
```

---

### Issue SEC-08: Missing Destination Protocol Validation on Link Redirection
- **Severity:** `MEDIUM`
- **Location:** [`apps/api/src/validators/link.validator.ts`](file:///d:/linkforge/apps/api/src/validators/link.validator.ts)

#### Code Remediation:
In `apps/api/src/validators/link.validator.ts`:
```diff
export const createLinkSchema = z.object({
- url: z.string().url(),
+ url: z.string().url().refine((val) => {
+   try {
+     const parsed = new URL(val);
+     return parsed.protocol === "http:" || parsed.protocol === "https:";
+   } catch {
+     return false;
+   }
+ }, { message: "URL must use http or https protocol" }),
  title: z.string().max(100).optional(),
  position: z.int(),
  public: z.boolean(),
});
```

---

### Issue SEC-09: Dedicated Rate Limiter on Password Reset Endpoint
- **Severity:** `MEDIUM`
- **Location:** [`apps/api/src/routes/v1/auth.routes.ts`](file:///d:/linkforge/apps/api/src/routes/v1/auth.routes.ts)

#### Code Remediation:
Add a dedicated rate limiter for password reset requests:
```ts
import { RateLimiterRedis } from "rate-limiter-flexible";
import { redis } from "../../lib/redis.ts";

export const passwordResetLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl:pwd-reset",
  points: 5, // 5 attempts
  duration: 15 * 60, // per 15 minutes
});
```

---

### Issue SEC-10: Public Exposure of Prometheus Telemetry Metrics Scrape Route
- **Severity:** `LOW`
- **Location:** [`apps/api/main.ts:135`](file:///d:/linkforge/apps/api/main.ts#L135)

#### Code Remediation:
In `apps/api/main.ts`:
```diff
app.get("/metrics", async (req, res) => {
+ const metricsToken = process.env.METRICS_TOKEN;
+ if (metricsToken) {
+   const authHeader = req.headers.authorization;
+   if (authHeader !== `Bearer ${metricsToken}`) {
+     return res.status(403).send("Forbidden");
+   }
+ }
  try {
    res.setHeader("Content-Type", getMetricsContentType());
    const metrics = await getMetrics();
    res.send(metrics);
  } catch (error) {
    res.status(500).send("Error collecting metrics");
  }
});
```

---

## Executive Implementation Checklist

- [ ] **P0:** Apply `protectedRoute` and remove `req.body.userId` in `apps/api/src/routes/v1/user.routes.ts` and `profile.controller.ts`.
- [ ] **P0:** Apply `adminAuthMiddleware` to `/admin/queues` and `/api/v1/admin/failed-jobs`.
- [ ] **P0:** Restrict Vercel regex in `apps/api/src/middlewares/cors.ts`.
- [ ] **P1:** Migrate `RateLimiterMemory` to `RateLimiterRedis`.
- [ ] **P1:** Refactor live visitors tracking from `SCAN` to Redis Sorted Sets (`ZSET`).
- [ ] **P1:** Add protocol whitelist (`http:`, `https:`) to `link.validator.ts`.
- [ ] **P2:** Add 2MB limit and MIME validation in `upload.middleware.ts`.
- [ ] **P2:** Add password reset endpoint rate limiter.
