# Walkthrough: Editable & Drag-and-Drop Social Media Links with Tiered Analytics

We have implemented social media management, zero-lag drag-and-drop reordering, click tracking, and tiered analytics (Free vs Pro) across LinkForge's full-stack architecture.

---

## 1. Summary of Changes

### Database & Types (`packages/types`, `apps/api/prisma`)
- **[schema.prisma](file:///d:/linkforge/apps/api/prisma/schema.prisma)**:
  - Added `SocialLink` model with `publicId` (for secure redirect links), `platform`, `url`, `position`, `counts`, `isActive`, and `deletedAt`.
  - Extended `ClickEvent` to support `socialLinkId` relation alongside `linkId`.
  - Added `socialLinks` relation to `User` model.
- **[packages/types/index.ts](file:///d:/linkforge/packages/types/index.ts)**:
  - Added `SocialLink`, `SocialPlatform`, `PublicProfileSocial`, and `SocialMediaAnalytics` types.

### Backend API & Worker Layer (`apps/api`)
- **[social.validator.ts](file:///d:/linkforge/apps/api/src/validators/social.validator.ts)**: Zod validation schemas for creating, updating, and reordering social media links.
- **[social.service.ts](file:///d:/linkforge/apps/api/src/services/social.service.ts)**: Service handling CRUD, atomic reorder transactions, publicId generation, and Redis cache management.
- **[social.controller.ts](file:///d:/linkforge/apps/api/src/controllers/social/social.controller.ts)**: REST endpoints for `/api/v1/socials` (`GET`, `POST`, `PATCH /:id`, `DELETE /:id`, `POST /reorder`).
- **[social.routes.ts](file:///d:/linkforge/apps/api/src/routes/v1/social.routes.ts)** & **[routes/v1/index.ts](file:///d:/linkforge/apps/api/src/routes/v1/index.ts)**: Mounted at `/api/v1/socials`.
- **[public-redirect.controller.ts](file:///d:/linkforge/apps/api/src/controllers/redirect/public-redirect.controller.ts)**: Enhanced `/r/:publicId` to support resolving and redirecting both standard links and social links while recording click events asynchronously via BullMQ.
- **[click.worker.ts](file:///d:/linkforge/apps/api/src/workers/click.worker.ts)** & **[click-event.service.ts](file:///d:/linkforge/apps/api/src/services/click-event.service.ts)**: Enabled asynchronous tracking of `socialLinkId`.
- **[profile.service.ts](file:///d:/linkforge/apps/api/src/services/profile.service.ts)**: Added active `socialLinks` to the public profile response.
- **[analytics.service.ts](file:///d:/linkforge/apps/api/src/services/analytics.service.ts)**: Aggregates social media clicks separately, computing `totalSocialClicks`, `topSocial` (for Free and Pro), and `clicksBySocial` (granular breakdown).

### Frontend Web Layer (`apps/web`)
- **[social-links.ts](file:///d:/linkforge/apps/web/apis/social-links.ts)**: Axios client for social links operations.
- **[use-social-links.ts](file:///d:/linkforge/apps/web/hooks/use-social-links.ts)**: React Query hooks for fetching and mutations.
- **[social-media-manager.tsx](file:///d:/linkforge/apps/web/components/custom/social-media-manager.tsx)**: Reusable drag-and-drop social media management component:
  - Supports 13+ popular platforms (Instagram, Twitter/X, YouTube, GitHub, LinkedIn, TikTok, Twitch, Discord, Spotify, Facebook, Telegram, Email, Custom).
  - Ultra-smooth, zero-lag drag-and-drop reordering powered by `@dnd-kit/react` and `@dnd-kit/react/sortable`.
  - Inline handle/URL editing, active visibility switch, platform badges, click counts, and delete actions.
- **[links/page.tsx](file:///d:/linkforge/apps/web/app/(dashboard)/dashboard/links/page.tsx)** & **[profile/page.tsx](file:///d:/linkforge/apps/web/app/(dashboard)/dashboard/profile/page.tsx)**: Integrated `SocialMediaManager`.
- **[profile-display.tsx](file:///d:/linkforge/apps/web/app/(user)/(components)/profile-display.tsx)** & **[public-profile/page.tsx](file:///d:/linkforge/apps/web/app/(user)/public-profile/page.tsx)**: Replaced static dummy socials with dynamic, user-ordered social media icons routed through `/r/:publicId` for click tracking.
- **[analytics-subpage.tsx](file:///d:/linkforge/apps/web/app/(dashboard)/(components)/analytics-subpage.tsx)**:
  - **Free Users**: Highlights the **#1 Top Most Clicked Social Media Platform** with click count, percentage, and a Pro teaser banner.
  - **Pro Users**: Unlocks the full **Detailed Social Media Breakdown** featuring rank (#1, #2, ...), platform icons, direct links, individual click counts, percentage shares, and progress bars.

---

## 2. Verification

- Added automated test suite **[social-links.test.ts](file:///d:/linkforge/apps/api/tests/social-links.test.ts)** verifying:
  1. Social link creation with automatic URL normalization and secure `publicId` generation.
  2. Drag-and-drop atomic reordering and position updates.
  3. Public profile query including ordered social links.
  4. Public redirect resolution and 302 HTTP response.
  5. Analytics computation: `totalSocialClicks`, `topSocial`, and `clicksBySocial`.
