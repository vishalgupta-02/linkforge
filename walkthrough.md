# Walkthrough - Pro Live Visitors Implementation

The **Pro Live Visitors** feature has been implemented directly in the existing Linkforge codebase. It tracks anonymous visitors viewing public profile pages in realtime using Redis TTL keys and pushes live visitor metrics to the dashboard owner via Server-Sent Events (SSE).

## Changes Summary

### 1. Redis Key & Service Layer
- **[cache-keys.ts](file:///d:/linkforge/apps/api/src/lib/cache-keys.ts)**: Added `LIVE_VISITOR_TTL = 90` seconds, `LIVE_HEARTBEAT_INTERVAL = 30_000` ms, and key builders `CACHE_KEYS.liveVisitor(userId, sessionId)` (`live:user:${userId}:visitor:${sessionId}`) and `CACHE_KEYS.liveVisitorPattern(userId)` (`live:user:${userId}:visitor:*`).
- **[live-session.ts](file:///d:/linkforge/apps/api/src/utils/live-session.ts)**: Aligned helper functions and re-exported constants.
- **[live.service.ts](file:///d:/linkforge/apps/api/src/services/live.service.ts)**:
  - `createLiveVisitor(userId, sessionId)`: sets Redis key with `EX 90`.
  - `refreshLiveVisitor(userId, sessionId)`: resets TTL to 90s (or recreates if expired).
  - `removeLiveVisitor(userId, sessionId)`: deletes the key idempotently.
  - `getLiveVisitorCount(userId)`: iterates keys using non-blocking cursor-based `redis.scan`.

### 2. Validation, Security & Plan Access
- **[live.validator.ts](file:///d:/linkforge/apps/api/src/validators/live.validator.ts)**: Zod validation schemas for `username` param and UUID `sessionId` body.
- **[plan.ts](file:///d:/linkforge/apps/api/src/utils/plan.ts)**: Centralized `isProPlan` feature gate helper (`PRO` / `BUSINESS`).
- **[live.controller.ts](file:///d:/linkforge/apps/api/src/controllers/live/live.controller.ts)**:
  - `joinLiveVisitors`: normalizes username, resolves user ID, creates presence, and returns count.
  - `heartbeatLiveVisitor`: refreshes 90s TTL.
  - `leaveLiveVisitor`: deletes session presence immediately.
  - `liveVisitorsStream`: verifies Better Auth session (`req.user.id`), verifies profile ownership (`user.id === req.user.id`), verifies Pro plan access (`isProPlan(user.plan)`), sets SSE headers, emits initial `visitors` event, polls count every 5s (emitting only on change), sends `: heartbeat\n\n` comments every 20s, and cleans up all timers when connection closes.
- **[live.routes.ts](file:///d:/linkforge/apps/api/src/routes/v1/live.routes.ts)**: Registered routes with Zod validation middleware and `protectedRoute` authentication.

### 3. Frontend Web Integration
- **[live-session.ts](file:///d:/linkforge/apps/web/lib/live-session.ts)**: Manages anonymous browser `crypto.randomUUID()` in `sessionStorage` under `linkflow_live_session`.
- **[use-live-presence.ts](file:///d:/linkforge/apps/web/hooks/use-live-presence.ts)**: Sends `/join` on mount, heartbeats every 30s, and sends beacon to `/leave` on unload.
- **[use-live-visitors.ts](file:///d:/linkforge/apps/web/hooks/use-live-visitors.ts)**: Connects `EventSource` with credentials to `/stream`, listens for `visitors` events, and manages `connected` state.
- **[public-page-presence.tsx](file:///d:/linkforge/apps/web/components/custom/public-page-presence.tsx)**: Headless client presence tracking component.
- **[page.tsx](file:///d:/linkforge/apps/web/app/(user)/username/[username]/page.tsx)**: Mounted `<PublicProfilePresence />` inside the server component.
- **[live-visitors.tsx](file:///d:/linkforge/apps/web/components/custom/live-visitors.tsx)**: Dashboard card component with live status pill, visitor count, and light/dark theme support.
- **[analytics-subpage.tsx](file:///d:/linkforge/apps/web/app/(dashboard)/(components)/analytics-subpage.tsx)**: Integrated `<LiveVisitors />` in the analytics overview.

---

## Verification Results

### Automated Tests
- **[live-presence.test.ts](file:///d:/linkforge/apps/api/tests/live-presence.test.ts)** and **[run-live-tests.ts](file:///d:/linkforge/apps/api/tests/run-live-tests.ts)**:
  - Redis key generation & scan pattern matching
  - Key creation with 90s TTL
  - Key refresh and expired key recreation
  - Idempotent removal
  - Cursor-based non-blocking SCAN counting
  - Zod UUID and parameter validation
  - Pro plan authorization gating
