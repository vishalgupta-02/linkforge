# Walkthrough: Centralize Types & Interfaces into `packages/types`

All shared types, interfaces, API payloads, and queue schemas have been moved to [`packages/types`](file:///d:/linkforge/packages/types).

---

## 1. Modular Structure in `packages/types`

The shared package is organized into modular domain files under [`packages/types/src/`](file:///d:/linkforge/packages/types/src):

| Module | Types & Interfaces |
| :--- | :--- |
| [`api.ts`](file:///d:/linkforge/packages/types/src/api.ts) | `ApiResponse<T>`, `ApiErrorResponse`, `PaginatedResponse<T>` |
| [`user.ts`](file:///d:/linkforge/packages/types/src/user.ts) | `User`, `UserProfileData`, `UserProfileResponse`, `UpdateProfilePayload`, `UpdateProfileResponse`, `Plan` |
| [`link.ts`](file:///d:/linkforge/packages/types/src/link.ts) | `Link`, `PublicProfileLink`, `CreateLinkPayload`, `UpdateLinkPayload`, `ReorderLinksPayload`, `GetLinksResponse` |
| [`social.ts`](file:///d:/linkforge/packages/types/src/social.ts) | `SocialPlatform`, `SocialLink`, `PublicProfileSocial`, `SocialClickItem`, `SocialMediaAnalytics`, `AddSocialLinkPayload`, `UpdateSocialLinkPayload`, `ReorderSocialLinksPayload` |
| [`analytics.ts`](file:///d:/linkforge/packages/types/src/analytics.ts) | `ClicksByDay`, `CountryData`, `DeviceData`, `SourceData`, `LinkData`, `AnalyticsResponse`, `AnalyticsSummary` |
| [`billing.ts`](file:///d:/linkforge/packages/types/src/billing.ts) | `BillingStatusData`, `BillingStatusResponse`, `BillingPortalResponse`, `CreateCheckoutPayload`, `CreateCheckoutResponse` |
| [`feedback.ts`](file:///d:/linkforge/packages/types/src/feedback.ts) | `FeedbackCategory`, `SubmitFeedbackParams`, `FeedbackResponse` |
| [`auth.ts`](file:///d:/linkforge/packages/types/src/auth.ts) | `RequestPasswordResetPayload`, `ResetPasswordPayload`, `VerifyEmailPayload`, `GenericAuthResponse`, `UserAuthSession` |
| [`email.ts`](file:///d:/linkforge/packages/types/src/email.ts) | `EmailJobType`, `WelcomeEmailJobData`, `VerifyEmailJobData`, `FeedbackEmailJobData`, `PasswordResetEmailJobData`, `ProUpgradeEmailJobData`, `ClickMilestoneEmailJobData`, `EmailJobData` |
| [`click.ts`](file:///d:/linkforge/packages/types/src/click.ts) | `ClickEventData`, `ClickJobData` |
| [`theme.ts`](file:///d:/linkforge/packages/types/src/theme.ts) | `ThemeKey`, `ThemeConfig` |
| [`index.ts`](file:///d:/linkforge/packages/types/src/index.ts) | Root re-export barrel file |

---

## 2. Updated Consumers

- **Frontend Clients (`apps/web`)**:
  - `apis/get-analytics.ts`
  - `apis/get-user-profile.ts`
  - `apis/update-profile.ts`
  - `apis/get-links.ts`
  - `apis/get-billing-status.ts`
  - `apis/get-billing-portal.ts`
  - `apis/create-checkout.ts`
  - `apis/auth-reset.ts`
  - `apis/feedback.ts`
  - `apis/social-links.ts`
  - `lib/themes.ts`
- **Backend Services (`apps/api`)**:
  - `src/queues/email.queue.ts`
  - `src/workers/email.worker.ts`
  - `src/emails/templates/FeedbackEmail.tsx`

---

## 3. Verification & Test Results

1. **API Build Compilation**:
   ```bash
   pnpm --filter api build
   ```
   **Result**: Prisma Client 7.8.0 generated, `server.js` and `worker.js` bundles compiled cleanly (Exit Code 0).

2. **Automated Test Suites**:
   ```bash
   pnpm --filter api exec tsx tests/feedback-email.test.ts && pnpm --filter api exec tsx tests/email-verification.test.ts
   ```
   **Result**: All 6 tests across feedback delivery, BullMQ job enqueueing, and email verification passed with exit code 0.
