# LinkForge: Pending and Promised Features Task Backlog

**Source Audit**: [`FEATURE_COMPLIANCE_AUDIT_REPORT.md`](file:///d:/linkforge/FEATURE_COMPLIANCE_AUDIT_REPORT.md) & Website Inspection (`/`, `/features`, `/pricing`, `/faq`, footer, dashboard)  
**Date**: September 22, 2026  
**Status**: Comprehensive Feature Gap & Implementation Task Matrix  

---

## Executive Overview & Task Matrix

The following table lists every feature advertised or promised across the LinkForge website, pricing tier table, FAQ, marketing bento cards, and schema definitions that is currently either **partially implemented**, **placeholder/mocked**, or **completely untouched (0% implemented)**.

| # | Feature / Promise | Promised Location | Current Status | Complexity | Priority |
| :- | :--- | :--- | :---: | :---: | :---: |
| 1 | **Custom Domains & SSL Engine** | `/pricing`, `/features`, `/faq`, `/dashboard/domains` | **0%** (Placeholder page only) | High | P1 |
| 2 | **Theme Studio & Profile Theme Persistence** | `/features`, `/pricing`, `/faq`, Bento Grid | **20%** (Frontend preview only; no DB/API) | Low | P1 |
| 3 | **Smart Vector QR Code Generator** | `/features`, `/pricing`, `/faq`, Bento Grid | **0%** (Untouched; only static icon) | Low | P1 |
| 4 | **Data Portability (CSV / JSON Export)** | `/pricing`, `/features`, `/faq` | **0%** (Untouched; no API or UI) | Low | P1 |
| 5 | **Scheduled Link Publishing & Expiration** | Schema, Architecture | **15%** (Columns exist; no UI, API ignores) | Medium | P2 |
| 6 | **Link Sections & Categories** | Schema, Admin Dashboard | **15%** (Schema exists; no API or UI) | Medium | P2 |
| 7 | **Watermark Removal for Pro Tier** | `/pricing` | **0%** (Hardcoded watermark in public profile) | Low | P2 |
| 8 | **City & Region Granular Analytics** | `/pricing`, `/faq`, `/features` | **25%** (Country-only; no city breakdown API/UI) | Medium | P2 |
| 9 | **Developer Integrations & Webhooks** | `/features`, `/dashboard/integrations` | **0%** (Placeholder page only) | High | P3 |
| 10 | **Mobile App Deep Linking** | `/features` (Technical Rigor Bento) | **0%** (Standard 302 HTTP redirects only) | Medium | P3 |
| 11 | **Native Mobile Apps (App Store / Google Play)** | Footer Download Badges | **0%** (Untouched; non-functional `<button>`) | High / Policy | P3 |
| 12 | **Documentation & Auxiliary Pages** | Footer Links (`/docs`, `/api`, `/blog`, etc.) | **0%** (All return 404 Not Found) | Medium | P3 |

---

## ️ Detailed Breakdown of Pending & Untouched Tasks

### 1. Custom Domains & Wildcard SSL (`/dashboard/domains`)
* **Where Promised**:
  - **Pricing Page**: Pro tier feature: *"Custom Domain Connection (links.yourname.com)"*.
  - **Features Page**: Bento Card: *"Your Domain. Your Brand. Connect links.yourbrand.com in seconds. Automatic Let's Encrypt wildcard SSL certification. A+ Grade TLS 1.3 Security."*
  - **FAQ Page**: *"You can connect any apex domain or subdomain by simply adding a CNAME or A record... automatically issues and renews an enterprise-grade Let's Encrypt TLS/SSL certificate."*
* **Current State**:
  - Prisma has `CustomDomain` model (`id, domainName, userId, verified, sslProvisioned`).
  - **Zero** API endpoints or controllers in `apps/api`.
  - Frontend `apps/web/app/(dashboard)/dashboard/domains/page.tsx` is an empty placeholder: `"Domains Page — This page will be implemented soon."`
  - No domain routing/mapping in Next.js middleware or Express redirect handlers.
* **Pending Action Items**:
  - [ ] **Backend CRUD & Verification Endpoints**:
    - `POST /api/v1/domains`: Register custom domain for user (restricted to Pro plan via `isProPlan`).
    - `GET /api/v1/domains`: List user's registered domains and verification status.
    - `DELETE /api/v1/domains/:id`: Remove domain.
    - `POST /api/v1/domains/:id/verify`: Trigger DNS verification check (checking CNAME to LinkForge edge or TXT record).
  - [ ] **SSL & Proxy Provisioning**:
    - Integrate with Cloudflare for SaaS API or Vercel Domains API to automate SSL provisioning and hostname routing.
  - [ ] **Next.js Hostname Middleware Routing**:
    - In `apps/web/middleware.ts`, detect requests matching custom domains (e.g. `host !== process.env.NEXT_PUBLIC_APP_DOMAIN`) and rewrite internally to the matching public profile page (`/user/:username`).
  - [ ] **Dashboard UI (`/dashboard/domains`)**:
    - Replace placeholder with domain connection card, DNS setup instructions (Type: CNAME, Target: `cname.linkforge.com`), verification refresh button, and SSL badge.

---

### 2. Theme Customization & Profile Theme Persistence
* **Where Promised**:
  - **Pricing Page**: *"All 8+ Designer Themes"*, *"Custom Button Shapes & Radius"*, *"Custom CSS & Font Pairings"*.
  - **Features Page**: Bento Card: *"Bespoke Designer Themes: Obsidian Dark, Tokyo Neon, Alabaster Clean, Sunset Horizon..."*
  - **FAQ Page**: *"Theme Studio where you can choose between minimal, dark, neon, and high-contrast designer themes..."*
* **Current State**:
  - `User` model in `prisma/schema.prisma` **lacks a `theme` field**.
  - `apps/api/src/controllers/user` does not accept, persist, or return themes.
  - Public profile page `apps/web/app/(user)/(components)/profile-display.tsx` attempts `profile.theme`, but always falls back to `default`.
  - `/dashboard/edit-public-profile` has local state preview that cannot save.
* **Pending Action Items**:
  - [ ] **Prisma Migration**:
    - Add `theme String @default("default")` to `User` model in `prisma/schema.prisma`.
    - (Optional) Add `buttonRadius String @default("rounded-2xl")` and `fontFamily String @default("sans")`.
  - [ ] **Backend API**:
    - Update `updateUserProfile` validator and controller in `apps/api/src/controllers/user` to accept `theme`.
    - Ensure `getPublicProfile` includes `theme` in the returned payload.
    - Enforce tier limits: allow Free users only 2 core themes (`default`, `minimal`), and Pro users all 8 themes.
  - [ ] **Dashboard UI**:
    - Wire `/dashboard/edit-public-profile/page.tsx` and `/dashboard/profile` theme selection to send `PATCH /api/v1/user/profile` with the selected theme.
  - [ ] **Public Profile Integration**:
    - Verify dynamic theme CSS classes apply properly on public profile routes (`/username/:username` and `/public-profile`).

---

### 3. Smart Vector QR Code Generator
* **Where Promised**:
  - **Pricing Page**: *"High-Resolution Vector (SVG/PNG) QR Codes"*.
  - **Features Page**: Bento Card: *"Smart Vector QR Codes: Generate crisp vector QR codes for business cards, conference slides, packaging, and event badges with one click."*
  - **FAQ Page**: *"Every LinkForge profile comes with an automatically generated high-resolution vector QR code that you can download in SVG or PNG format."*
* **Current State**:
  - **Untouched (0%)**: No QR code library installed or generator component created anywhere in `apps/web` or `apps/api`. Only static Lucide `<QrCode />` icons are shown.
* **Pending Action Items**:
  - [ ] **Install Dependency**:
    - Add `qrcode.react` or `@types/qrcode` / `qrcode` to `apps/web`.
  - [ ] **Build QR Generator Component**:
    - Create `QrCodeModal` component supporting:
      - Live QR code preview of creator's profile URL (`https://linkforge.com/username`).
      - Download as SVG (vector) for print.
      - Download as PNG (high-res raster: 1024x1024).
      - Optional embedded LinkForge center icon or avatar.
  - [ ] **UI Integration**:
    - Add "Share / QR Code" button to `/dashboard/links` header and individual link action dropdowns.
    - Add QR Code download section to `/dashboard/profile`.

---

### 4. Data Portability (CSV / JSON Export)
* **Where Promised**:
  - **Pricing Page**: *"CSV / JSON Data Export (Pro plan)"*.
  - **Features Page**: *"Instant Data Portability: Export your click history, top referrer statistics, and link configurations anytime."*
  - **FAQ Page**: *"Pro users can export their complete profile configuration, links, and detailed historical analytics logs in structured CSV or JSON formats."*
* **Current State**:
  - **Untouched (0%)**: No export endpoints exist in `apps/api/src/controllers/analytics` or `link`. No download triggers exist in `/dashboard/analytics`.
* **Pending Action Items**:
  - [ ] **Backend Export Endpoints**:
    - `GET /api/v1/analytics/export?format=csv|json`:
      - Gated by `isProPlan(user.plan)`.
      - Returns streaming CSV or JSON download with headers `Content-Disposition: attachment; filename="linkforge-analytics.csv"`.
      - Includes click timestamps, link public ID, title, destination URL, country, city, device type, browser, and referrer.
    - `GET /api/v1/links/export?format=csv|json`:
      - Exports list of user links with click counters, titles, URLs, and active status.
  - [ ] **Frontend Export Triggers**:
    - Add "Export Report" dropdown (CSV / JSON) on `/dashboard/analytics`.
    - If user is on Free tier, open upgrade modal.

---

### 5. Scheduled Link Publishing & Expiration
* **Where Promised**:
  - **Prisma Schema & Architecture**: Columns `scheduledStart` and `scheduledEnd` explicitly exist on `Link` table.
* **Current State**:
  - Columns exist in PostgreSQL, but frontend link creation/edit forms hardcode them to `null`.
  - `public-redirect.controller.ts` does not check date boundaries when resolving links.
  - `user.controller.ts` / `link.service.ts` do not filter scheduled links when rendering public profiles.
* **Pending Action Items**:
  - [ ] **Frontend Date-Time Inputs**:
    - Add optional "Schedule Link" toggle in link creation/edit cards on `/dashboard/links`.
    - Provide date-time pickers for `scheduledStart` (publish time) and `scheduledEnd` (expiration time).
  - [ ] **Backend Enforcement**:
    - In `public-redirect.controller.ts`:
      - Block redirection if `link.scheduledStart && now < link.scheduledStart` or `link.scheduledEnd && now > link.scheduledEnd` (return 404 or "Link expired / not yet active").
    - In `getPublicLinks` / `getPublicProfile`:
      - Filter links where `(scheduledStart IS NULL OR scheduledStart <= NOW()) AND (scheduledEnd IS NULL OR scheduledEnd >= NOW())`.

---

### 6. Link Sections & Categorization
* **Where Promised**:
  - **Prisma Schema & Product Dossier**: `LinkSection` model exists in `prisma/schema.prisma` (`id, title, position, userId`).
* **Current State**:
  - `LinkSection` table is in schema, but zero CRUD routes exist in `apps/api/src/routes/v1`.
  - `/dashboard/links` only provides a flat list of links with no section headers or grouping interface.
* **Pending Action Items**:
  - [ ] **Database Relation**:
    - Verify/add `sectionId String?` foreign key on `Link` referencing `LinkSection.id`.
  - [ ] **Backend CRUD Endpoints**:
    - `POST /api/v1/sections`: Create section header.
    - `GET /api/v1/sections`: Fetch sections for user.
    - `PATCH /api/v1/sections/:id`: Rename or reorder section.
    - `DELETE /api/v1/sections/:id`: Delete section (unlink child links).
  - [ ] **Frontend Grouping UI**:
    - Support section creation in `/dashboard/links`.
    - Enable dragging links between sections or reordering whole sections with `@dnd-kit`.
  - [ ] **Public Profile Display**:
    - Render section title dividers above grouped links on `/username/:username`.

---

### 7. Watermark Removal for Pro Tier
* **Where Promised**:
  - **Pricing Page**: *"Remove LinkForge Watermark: Free: No, Pro: Yes"*.
* **Current State**:
  - `apps/web/app/(user)/(components)/profile-display.tsx` unconditionally renders the LinkForge footer badge (`<LinkIcon /> LINKFORGE`) with no plan checks or user preferences.
* **Pending Action Items**:
  - [ ] **User Preference / Plan Check**:
    - Check user's plan (`profile.data?.plan === 'PRO' || profile.data?.plan === 'BUSINESS'`).
    - (Optional) Add `hideWatermark Boolean @default(false)` setting in `User` model.
  - [ ] **Frontend Profile Display**:
    - Conditionally hide the bottom LinkForge badge if the user is a Pro subscriber and has enabled watermark hiding.

---

### 8. City & Region Granular Analytics
* **Where Promised**:
  - **Pricing Page**: *"Geographic Location & City Breakdown: Free: Country only, Pro: Full City & Region"*.
  - **FAQ Page**: *"Geographic distribution (country and city level on Pro)"*.
  - **Features Page Bento**: Bento visual shows *"Top City: San Francisco"*.
* **Current State**:
  - Ingestion worker stores country in `ClickEvent`. City data is either not saved or not aggregated in `/api/v1/analytics`.
  - Frontend `/dashboard/analytics` only displays country flags and counts.
* **Pending Action Items**:
  - [ ] **Click Ingestion Worker**:
    - Verify `geoip-lite` or MaxMind GeoIP extracts `geo.city` and `geo.region` and stores them in `ClickEvent` table (`city`, `region` columns).
  - [ ] **Analytics Service & Route**:
    - Add `cityBreakdown` query to `analytics.service.ts` (aggregating top 10 cities for Pro users).
  - [ ] **Frontend UI**:
    - Add a "Top Cities" card/tab to `/dashboard/analytics` with a Pro badge/lock for free tier users.

---

### 9. Developer Integrations & Webhooks (`/dashboard/integrations`)
* **Where Promised**:
  - **Features Page**: *"Developer-grade integrations, webhooks, and API access"*.
  - **Dashboard Navigation**: Direct navigation item `/dashboard/integrations`.
* **Current State**:
  - **Untouched (0%)**: `apps/web/app/(dashboard)/dashboard/integrations/page.tsx` is an empty placeholder: `"Integrations Page — This page will be implemented soon."`
  - Zero webhook subscription models, dispatch queues, or API key management in backend.
* **Pending Action Items**:
  - [ ] **Database Schema**:
    - Add `WebhookSubscription` (`id, userId, url, secret, events, isActive, createdAt`).
    - Add `ApiKey` (`id, userId, keyHash, name, lastUsedAt, createdAt`).
  - [ ] **Webhook Dispatch Worker**:
    - Create a BullMQ `webhook-dispatch` queue.
    - When a click event is processed, dispatch a signed payload (`HMAC-SHA256`) to active user webhooks.
  - [ ] **Developer API Key Middleware**:
    - Add Express middleware supporting `Authorization: Bearer lf_live_...` for external programmatic link management.
  - [ ] **Dashboard UI (`/dashboard/integrations`)**:
    - Build UI to create webhook endpoints, test endpoints with sample ping, view delivery logs, and generate API keys.

---

### 10. Mobile App Deep Linking Protocol Handling
* **Where Promised**:
  - **Features Page**: Technical Rigor Bento: *"Mobile App Deep Linking: Open links directly inside native Instagram, TikTok, YouTube, and Spotify apps instead of in-app web views."*
* **Current State**:
  - `/r/:publicId` in `apps/api/src/controllers/redirect/public-redirect.controller.ts` only issues standard HTTP 302 redirects to destination web URLs (`res.redirect(302, link.url)`).
* **Pending Action Items**:
  - [ ] **User-Agent & Protocol Mapping**:
    - When mobile User-Agents (iOS / Android) are detected, map known platforms to URI schemes (e.g. `youtube://`, `instagram://user?username=`, `spotify://`).
    - Implement fallback interstitial or universal link handling so users on mobile are redirected smoothly to the native app.

---

### 11. Native Mobile Apps (App Store / Google Play Badges)
* **Where Promised**:
  - **Website Footer**: Prominent *"Download on the App Store"* and *"Get It On Google Play"* download buttons.
* **Current State**:
  - **Untouched (0%)**: Both buttons in `apps/web/components/custom/footer.tsx` are non-functional `<button>` wrappers without URLs or action handlers. No native iOS/Android apps exist.
* **Pending Action Items**:
  - [ ] **Immediate Compliance Fix**:
    - Either remove the misleading App Store / Google Play buttons from `apps/web/components/custom/footer.tsx` or replace them with a "PWA / Add to Home Screen" prompt or "Coming Soon" modal.
  - [ ] **Long-term**:
    - Configure Progressive Web App (PWA) manifest and service worker (`manifest.json`, app icons, install prompt).

---

### 12. Documentation & Auxiliary Footer Links (404 Routes)
* **Where Promised**:
  - **Website Footer Navigation**: Links to `/docs`, `/api`, `/blog`, `/help`, `/templates`, `/about`, `/changelog`.
* **Current State**:
  - **Untouched (0%)**: Every one of these routes produces a Next.js 404 (Page Not Found) error.
* **Pending Action Items**:
  - [ ] **Create Missing Informational Pages**:
    - `apps/web/app/about/page.tsx`: Company story, mission, and team.
    - `apps/web/app/changelog/page.tsx`: Product release notes and updates.
    - `apps/web/app/help/page.tsx`: Help center & support contact form.
    - `apps/web/app/templates/page.tsx`: Creator template gallery.
    - `apps/web/app/docs/page.tsx` & `/api`: Getting started guide and REST API documentation.
  - [ ] **Alternative Quick Fix**:
    - Prune or redirect currently unbuilt routes in `footer.tsx` to active destinations (`/features`, `/pricing`, `/feedback`, or `/contact`).

---

## Recommended Prioritization & Phased Execution

```mermaid
flowchart LR
    subgraph Phase 1 [Phase 1: Quick Wins & High Impact]
        T1[Theme Persistence]
        T2[Vector QR Generator]
        T3[CSV/JSON Data Export]
        T4[Watermark Removal Logic]
        T5[Footer 404 Cleanup]
    end

    subgraph Phase 2 [Phase 2: Core Platform Gaps]
        T6[Scheduled Links UI & Checks]
        T7[Link Sections & Categories]
        T8[City-Level Analytics]
    end

    subgraph Phase 3 [Phase 3: Advanced Infrastructure]
        T9[Custom Domains & SSL Engine]
        T10[Webhooks & Developer API]
        T11[Mobile App Deep Linking]
    end

    Phase 1 --> Phase 2 --> Phase 3
```

1. **Phase 1 (Immediate / Days 1–3)**:
   - Persist user themes (`theme` in schema + API + UI).
   - Add QR Code generation and export modal.
   - Add CSV/JSON export endpoint and dashboard trigger for Pro users.
   - Wire watermark removal check for Pro users.
   - Remove fake App Store buttons or clean up 404 footer links.
2. **Phase 2 (Near-Term / Days 4–7)**:
   - Implement scheduled link date pickers and runtime query filters.
   - Add `LinkSection` CRUD and public profile category dividers.
   - Add city-level breakdown in analytics worker and dashboard.
3. **Phase 3 (Medium-Term / Days 8–15)**:
   - Full Custom Domain verification engine and Next.js hostname routing.
   - Developer API & Webhook dispatch pipeline with dashboard key management.
   - Deep linking handler for native mobile applications.
