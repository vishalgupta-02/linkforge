# Walkthrough: Dashboard Live Metrics & Product Completion

We investigated why the dashboard was displaying static values, audited the surrounding product features for unfinished or mock implementations, and resolved all data flow, UI, and backend inconsistencies.

---

## 1. Root Causes Identified

1. **Dashboard Overview Metrics**:
   - `Total Views` was hardcoded to `0` with `0% from last week`.
   - `CTR` was hardcoded to `0%` with `0% from last week`.
   - `Active Links` was calculating `links.length` (total link count) rather than active links.
   - `togglePublic` visibility button in the dashboard links list was commented out (`// onClick={() => togglePublic(link.id, link.public)}`).
   - Quick setup guide steps were static display blocks without interactive actions or links.

2. **Dashboard Profile (`/dashboard/profile`)**:
   - The entire page was a static mock layout with hardcoded strings ("Sarah Creative", "sarah@example.com", "linkforge.bio/sarah", mock links).
   - "Save Changes" and "Upload new photo" were non-functional.

3. **Dashboard Settings (`/dashboard/settings`)**:
   - Contained static mock fallbacks (`"sarah@example.com"`, `"@sarahdesign"`).
   - Theme toggle used isolated local component state (`useState`) and did not toggle the actual application theme with `next-themes`.
   - Action buttons ("Change Username", session management) were inert.

4. **Public Profile Resolution**:
   - `PublicProfileDisplay` relied on non-existent `profile.avatarUrl` instead of checking `profile.data?.image || profile.image`.
   - Link public/active filtering was checking `!link.scheduledStart` instead of `link.public && link.isActive`.

5. **Backend Data & Logic (`apps/api`)**:
   - `username.service.ts`: Used `username` instead of Prisma's `userName` field, throwing Prisma validation errors when changing username. Also lacked Redis cache invalidation for updated usernames.
   - `profile.service.ts`: `getPublicProfileByUserId` did not select `name`, `bio`, `image`, and `email`, which prevented frontend profile hooks (`useUserProfile()`) from receiving user details. `updateProfile` omitted `name`.
   - `upload.routes.ts`: Missing `protectedRoute` authentication middleware on avatar upload route.

---

## 2. Changes Made

### Backend API
- **[`apps/api/src/services/username.service.ts`](file:///d:/linkforge/apps/api/src/services/username.service.ts)**:
  - Fixed Prisma model field access from `username` to `userName`.
  - Added cache invalidation via `redis.del(CACHE_KEYS.publicProfile(...))` for both the previous and new usernames.
- **[`apps/api/src/services/profile.service.ts`](file:///d:/linkforge/apps/api/src/services/profile.service.ts)**:
  - Enhanced `getPublicProfileByUserId` to select `id`, `name`, `userName`, `bio`, `image`, `email`, and `plan`.
  - Enhanced `updateProfile` to accept and update `name` in addition to `bio` and `image`.
- **[`apps/api/src/validators/profile.validator.ts`](file:///d:/linkforge/apps/api/src/validators/profile.validator.ts)**:
  - Added `name: z.string().min(1).max(100).optional()` to `updateProfileSchema`.
- **[`apps/api/src/routes/v1/upload.routes.ts`](file:///d:/linkforge/apps/api/src/routes/v1/upload.routes.ts)**:
  - Attached `protectedRoute` middleware to secure avatar image uploads.

### Web Frontend
- **[`apps/web/apis/update-profile.ts`](file:///d:/linkforge/apps/web/apis/update-profile.ts)**:
  - Created API helper functions: `updateUserProfile`, `changeUsernameApi`, and `uploadAvatarImage`.
- **[`apps/web/apis/get-user-profile.ts`](file:///d:/linkforge/apps/web/apis/get-user-profile.ts)**:
  - Extended `UserProfileData` interface with `name`, `bio`, `image`, and `email`.
- **[`apps/web/app/(dashboard)/(components)/user-dashboard.tsx`](file:///d:/linkforge/apps/web/app/(dashboard)/(components)/user-dashboard.tsx)**:
  - Replaced hardcoded static cards with dynamic live metrics:
    - **Total Clicks**: All-time click count from analytics.
    - **7-Day Clicks**: Recent period traffic from analytics.
    - **Top Location**: Top country name, flag, click count, and percentage.
    - **Active Links**: Active link count over total links (`${activeCount} / ${totalCount}`).
  - Wired working `togglePublic` link status toggle with query cache invalidation and toast notifications.
  - Made Quick Setup Guide steps interactive (navigating to Profile and Links, and copying public profile URL).
- **[`apps/web/app/(dashboard)/dashboard/profile/page.tsx`](file:///d:/linkforge/apps/web/app/(dashboard)/dashboard/profile/page.tsx)**:
  - Replaced static mock layout with a functional profile management interface.
  - Added real form state for Name, Username, and Bio with `updateUserProfile` and `changeUsernameApi`.
  - Added live avatar file upload via hidden input and `uploadAvatarImage`.
  - Connected real user links into the Links tab with active toggles and quick navigation.
  - Linked Analytics and Security & Billing tabs to their respective routes.
- **[`apps/web/app/(dashboard)/(components)/settings-subpage.tsx`](file:///d:/linkforge/apps/web/app/(dashboard)/(components)/settings-subpage.tsx)**:
  - Removed static mock email/username fallbacks.
  - Integrated `useTheme()` from `next-themes` to switch Light / Dark / System modes globally across the entire app.
  - Connected "Change Username" and "View in Profile" to navigate to `/dashboard/profile`.
  - Connected session management / sign out actions with `authClient`.
- **[`apps/web/app/(user)/(components)/profile-display.tsx`](file:///d:/linkforge/apps/web/app/(user)/(components)/profile-display.tsx)**:
  - Fixed fallback resolution for avatar images, display names, and bios.
- **[`apps/web/app/(user)/public-profile/page.tsx`](file:///d:/linkforge/apps/web/app/(user)/public-profile/page.tsx)**:
  - Fixed public link filtering to accurately filter by `link.public && link.isActive`.

---

## 4. Drag & Drop Reordering (Desktop & Mobile)

### Root Causes
1. **Event Model Mismatch (`@dnd-kit/react` v0.4)**:
   - In `@dnd-kit/react` v0.4, the drag event object uses `event.operation` containing `source` and `target` instead of legacy `@dnd-kit/core` properties `event.active` and `event.over`.
   - The previous code performed `if (!operation?.active || !operation?.over) return;` which failed silently on every drag release.
2. **Mobile Touch Handling**:
   - On touch devices, swiping on elements triggers browser page scrolling by default unless `touch-action: none` / CSS `touch-none` is applied to the drag handle.
3. **Handle & Sortable Hook Usage**:
   - In `@dnd-kit/react`, `useSortable` returns separate `ref` (for the item container) and `handleRef` (for the drag handle button) functions.
4. **Backend Sync**:
   - Reordering was missing an atomic batch sync endpoint call.

### Changes Applied
- **[`apps/web/app/(dashboard)/(components)/draggable-links.tsx`](file:///d:/linkforge/apps/web/app/(dashboard)/(components)/draggable-links.tsx)**:
  - Configured `useSortable({ id, index: index.position })` with `ref={ref}` on the `<li>` element and `ref={handleRef}` on the drag handle button.
  - Added `touch-none` and `style={{ touchAction: "none" }}` to the drag button to prevent touch scroll conflicts on mobile devices.
  - Added visual dragging states (elevation shadow, border accent, subtle scale) when an item is being dragged.
### Persistence & Refresh Root Causes Identified & Fixed
1. **Asynchronous State Race Condition in `handleDragEnd`**:
   - `updatedLinks` was being populated inside `setLinks((currentLinks) => { ... updatedLinks = moved; })` callback, which is queued asynchronously by React.
   - The subsequent `if (updatedLinks.length > 0)` check was executing before React ran the updater callback, evaluating to false and bypassing `reorderLinksApi` entirely.
   - **Fix**: Calculated `moved` and `updatedLinks` synchronously from current `links`, updated state with `setLinks(updatedLinks)`, and immediately sent `persistedLinkIds` to `reorderLinksApi`.
2. **Backend Query Sorting (`getLinks`)**:
   - In [`apps/api/src/services/link.service.ts`](file:///d:/linkforge/apps/api/src/services/link.service.ts), `getLinks(userId)` was hardcoded to `orderBy: { createdAt: "desc" }`, causing all links to revert to creation-date order whenever the page reloaded.
   - **Fix**: Changed `orderBy` in `getLinks` to `[{ position: "asc" }, { createdAt: "asc" }]`.
3. **Public Profile Cache Invalidation**:
   - Added Redis cache invalidation (`redis.del(CACHE_KEYS.publicProfile(user.userName))`) to `reorderLinks`, `updateLink`, and `deleteLink` so public profiles always reflect reordered positions immediately.
4. **Client Load Sorting**:
   - In [`apps/web/app/(dashboard)/dashboard/links/page.tsx`](file:///d:/linkforge/apps/web/app/(dashboard)/dashboard/links/page.tsx), `loadLinks()` explicitly sorts by `position` upon mounting.

---

## 5. Verification & Results

- **Data Flow Trace**: Verified all paths from UI state -> API client -> route handler -> service layer -> database -> cache invalidation -> UI feedback.
- **Dashboard Metrics**: All overview cards reflect live analytics and link state instead of hardcoded `0` or `0%` placeholders.
- **Profile Management**: Profile page loads the current user's profile and allows saving changes to display name, username, bio, and avatar.
- **Theme Consistency**: Settings theme toggling synchronizes with `next-themes` and updates the application theme in real time.
- **Drag & Drop Persistence**:
  - **Desktop & Mobile Interaction**: Pointer/touch drag immediately reorders the UI smoothly.
  - **Atomic DB Transaction**: `PATCH /api/v1/links/reorder` updates all `position` columns atomically in Prisma.
  - **Refresh / Reload**: When refreshed, `getLinks` queries Prisma by `position: "asc"`, preserving the exact reordered state.

---

## 6. Security, Reliability & Abuse Remediations

### Applied Remediations
1. **Resolved BOLA / IDOR on User Profile** ([`user.routes.ts`](file:///d:/linkforge/apps/api/src/routes/v1/user.routes.ts), [`profile.controller.ts`](file:///d:/linkforge/apps/api/src/controllers/user/profile.controller.ts)):
   - Protected `/user/me` and added `/me` with `protectedRoute`.
   - Replaced unauthenticated `req.body.userId` with session-authenticated `req.user.id`.
2. **Protected Admin Queue Dashboard & Failed Jobs** ([`main.ts`](file:///d:/linkforge/apps/api/main.ts), [`admin.routes.ts`](file:///d:/linkforge/apps/api/src/routes/v1/admin.routes.ts), [`admin-auth.middleware.ts`](file:///d:/linkforge/apps/api/src/middlewares/admin-auth.middleware.ts)):
   - Created `adminAuthMiddleware` enforcing admin email checks (`ADMIN_EMAILS`) or `ADMIN_SECRET_KEY` bearer tokens.
   - Applied to `/admin/queues` and `GET /api/v1/admin/failed-jobs`.
3. **Hardened CORS Configuration** ([`cors.ts`](file:///d:/linkforge/apps/api/src/middlewares/cors.ts)):
   - Restricted Vercel regex to specific LinkForge staging/preview subdomains (`/^https:\/\/linkforge(-[a-zA-Z0-9_-]+)?\.vercel\.app$/`).
4. **Distributed Redis Rate Limiting** ([`rateLimit.ts`](file:///d:/linkforge/apps/api/src/middlewares/rateLimit.ts)):
   - Replaced in-memory `RateLimiterMemory` with distributed `RateLimiterRedis`.
5. **Live Visitor $O(1)$ Optimization** ([`live.service.ts`](file:///d:/linkforge/apps/api/src/services/live.service.ts), [`cache-keys.ts`](file:///d:/linkforge/apps/api/src/lib/cache-keys.ts)):
   - Replaced full Redis keyspace `SCAN` loops with Redis Sorted Sets (`ZSET`) and `ZREMRANGEBYSCORE`.
6. **URL Protocol Validation** ([`link.validator.ts`](file:///d:/linkforge/apps/api/src/validators/link.validator.ts)):
   - Restricted link URLs to strictly `http:` and `https:`.
7. **Multipart Upload Protection** ([`upload.middleware.ts`](file:///d:/linkforge/apps/api/src/middlewares/upload.middleware.ts)):
   - Enforced 2MB maximum file size limit and MIME type validation (`image/jpeg`, `image/png`, `image/webp`, `image/gif`).
8. **Password Reset Abuse Protection** ([`auth.routes.ts`](file:///d:/linkforge/apps/api/src/routes/v1/auth.routes.ts)):
   - Applied a dedicated 5 attempts per 15 minutes Redis rate limiter to `POST /api/v1/auth/forgot-password`.
9. **Metrics Endpoint Protection** ([`main.ts`](file:///d:/linkforge/apps/api/main.ts)):
   - Added `METRICS_TOKEN` authentication to `GET /metrics`.

