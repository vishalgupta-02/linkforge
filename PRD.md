# LinkFlow

## Smart Link-in-Bio & Analytics Platform

### Product Requirements Document — Version 1.0

---

## Document Meta

| Field            | Value                              |
| ---------------- | ---------------------------------- |
| **Status**       | Draft — Pending Stakeholder Review |
| **Owner**        | Product Manager                    |
| **Created**      | February 2025                      |
| **Last Updated** | February 28, 2025                  |
| **Version**      | 1.0                                |

---

## 1. Executive Summary

LinkFlow is a multi-tenant SaaS platform that empowers creators, professionals, and businesses to consolidate their online presence into a single, beautiful, trackable link page. Unlike existing solutions, LinkFlow combines a fully customizable link-in-bio page with enterprise-grade click analytics, real-time visitor insights, custom domain support, and a monetization layer — all under one roof.

This document defines the complete product requirements for the initial release (v1.0) and lays out the phased roadmap through v2.0.

---

## 2. Problem Statement

### 2.1 The Pain

Creators, freelancers, small businesses, and personal brands face a fragmented digital identity. Social platforms allow only one link in a bio, forcing users to either pick one destination or rely on third-party tools with severe limitations:

- Existing tools (Linktree, Beacons, etc.) offer minimal analytics — only total clicks, no geography, device, or referral data
- No support for custom domains on free plans
- No ability to run A/B tests on link ordering or CTAs
- No monetization — no way to sell products or collect payments directly
- Generic, template-driven designs that don't reflect a creator's brand

### 2.2 The Opportunity

The creator economy has surpassed 200 million creators globally. Every one of them needs a single digital destination. LinkFlow enters this market with a data-first, developer-grade approach that serves both casual users and power users — from a solo influencer to a 50-person marketing team.

---

## 3. Goals & Success Metrics

### 3.1 Business Goals

- Acquire 10,000 registered users within 6 months of launch
- Convert 8% of free users to paid Pro plan within 90 days
- Achieve $25,000 MRR by end of Month 9
- Maintain 99.9% platform uptime SLA

### 3.2 Product Goals

- Reduce the time to publish a live link page to under 3 minutes
- Deliver click analytics with under 2-second data refresh latency
- Support custom domains with automatic HTTPS provisioning
- Enable direct payments and digital product sales from the link page

### 3.3 Success Metrics (KPIs)

| Metric                     | Baseline | Target (Month 6) | Measurement                |
| -------------------------- | -------- | ---------------- | -------------------------- |
| Registered Users           | 0        | 10,000           | User DB count              |
| Monthly Active Users (MAU) | 0        | 6,000            | Login events / 30 days     |
| Free → Pro Conversion      | N/A      | 8%               | Stripe subscription events |
| MRR                        | $0       | $25,000          | Stripe dashboard           |
| Page Load Time (P95)       | N/A      | < 800ms          | Vercel analytics           |
| Uptime                     | N/A      | 99.9%            | Grafana / Sentry           |
| Support Ticket Volume      | N/A      | < 50/week        | Intercom                   |

---

## 4. Target Users & Personas

### 4.1 Primary Personas

#### Persona 1 — The Creator (Free Plan)

- **Age:** 18–35
- **Platforms:** Instagram, TikTok, YouTube
- **Goal:** Send followers to multiple destinations (merch, YouTube, Spotify, Discord) from one bio link
- **Pain Point:** Current tools don't show which link gets the most clicks or where followers are coming from
- **Success Metric:** Has a live page with analytics in under 5 minutes

#### Persona 2 — The Freelancer / Professional (Pro Plan)

- **Age:** 25–45
- **Platforms:** LinkedIn, Twitter/X, personal website
- **Goal:** Replace their personal website with a fast, professional link page that showcases portfolio, books calls, and accepts payments
- **Pain Point:** Website is expensive, slow to update, and has no analytics
- **Success Metric:** Replaces their website, earns first payment through LinkFlow within 30 days

#### Persona 3 — The Small Business / Team (Business Plan)

- **Age:** 30–55
- **Platforms:** Instagram ads, Facebook, physical QR codes
- **Goal:** Run multiple link pages per campaign, track conversions, and measure ROI
- **Pain Point:** No way to A/B test different CTAs or attribute revenue to specific campaigns
- **Success Metric:** Has 5 team members managing separate pages, all on one billing account

### 4.2 Out of Scope Users

- Enterprise organizations with SSO/SAML requirements (deferred to v2.0)
- Developers seeking a fully headless/API-only solution (deferred to v2.0)

---

## 5. Scope

### 5.1 In Scope — v1.0

- User authentication (email/password, Google OAuth, GitHub OAuth)
- Public link page at linkflow.app/username
- Link management (add, edit, delete, reorder links)
- Profile customization (avatar, bio, theme, colors)
- Click analytics dashboard (total clicks, geography, device type, referral source)
- Custom domain support (Pro+)
- Stripe payments — Pro and Business subscription plans
- Email notifications (welcome, plan upgrade, milestone alerts)
- Admin panel for internal operations

### 5.2 Out of Scope — v1.0 (Deferred to v2.0)

- Mobile native apps (iOS / Android)
- A/B testing for links
- Digital product sales / direct payments from link page
- API access for external integrations
- SSO / SAML enterprise authentication
- White-label platform

---

## 6. Feature Requirements

### 6.1 Authentication & Onboarding

All unauthenticated users land on the marketing homepage. Authentication is handled via a dedicated /auth route.

| ID      | Feature               | Description                                                                   | Priority |
| ------- | --------------------- | ----------------------------------------------------------------------------- | -------- |
| AUTH-01 | Email/Password Signup | User registers with email and password. Email verified before access granted. | P0       |
| AUTH-02 | Google OAuth          | One-click signup/login via Google OAuth 2.0.                                  | P0       |
| AUTH-03 | GitHub OAuth          | One-click signup/login via GitHub OAuth.                                      | P1       |
| AUTH-04 | Forgot Password       | User receives reset link via email. Link expires in 1 hour.                   | P0       |
| AUTH-05 | Onboarding Flow       | 3-step wizard after signup: choose username, add first 3 links, pick a theme. | P0       |
| AUTH-06 | Account Deletion      | User can permanently delete their account and all data (GDPR compliance).     | P1       |

### 6.2 Link Management

The core value of LinkFlow. Users manage their links via a drag-and-drop dashboard.

| ID      | Feature           | Description                                                                      | Priority |
| ------- | ----------------- | -------------------------------------------------------------------------------- | -------- |
| LINK-01 | Add Link          | User adds a link with title, URL, and optional icon or thumbnail.                | P0       |
| LINK-02 | Edit Link         | User edits title, URL, icon, or visibility of any link inline.                   | P0       |
| LINK-03 | Delete Link       | User soft-deletes a link (recoverable within 30 days).                           | P0       |
| LINK-04 | Reorder Links     | Drag-and-drop reordering. Order is persisted immediately.                        | P0       |
| LINK-05 | Toggle Visibility | User can hide a link without deleting it.                                        | P0       |
| LINK-06 | Link Limit — Free | Free users limited to 8 active links.                                            | P0       |
| LINK-07 | Link Limit — Pro  | Pro users get unlimited links.                                                   | P0       |
| LINK-08 | Schedule Link     | Pro users can set a date range for a link to be visible (e.g., event promotion). | P1       |
| LINK-09 | Link Sections     | Pro users can group links under section headers.                                 | P1       |

### 6.3 Page Customization

| ID      | Feature                     | Description                                                                             | Priority |
| ------- | --------------------------- | --------------------------------------------------------------------------------------- | -------- |
| PAGE-01 | Username / Slug             | User chooses a unique username at signup. Editable once per 30 days.                    | P0       |
| PAGE-02 | Profile Photo               | User uploads an avatar (max 5MB, auto-resized to 400x400px).                            | P0       |
| PAGE-03 | Bio Text                    | User adds a short bio (max 160 characters).                                             | P0       |
| PAGE-04 | Theme Selection             | 8 built-in themes for free users. Unlimited custom themes for Pro.                      | P0       |
| PAGE-05 | Background Color / Gradient | Pro users can set custom background colors or gradients.                                | P1       |
| PAGE-06 | Button Style                | Pro users choose from 6 link button styles (rounded, sharp, outline, etc.).             | P1       |
| PAGE-07 | Custom Font                 | Pro users select from 12 Google Fonts for their page.                                   | P1       |
| PAGE-08 | Social Icons                | User can add social profile icons (Instagram, Twitter, LinkedIn, etc.) shown below bio. | P0       |
| PAGE-09 | SEO Meta                    | Pro users set custom Open Graph title, description, and image for link previews.        | P1       |

### 6.4 Analytics

Analytics are the core differentiator. All clicks are tracked asynchronously — tracking must never slow down page redirects.

| ID     | Feature                 | Description                                                              | Priority |
| ------ | ----------------------- | ------------------------------------------------------------------------ | -------- |
| ANA-01 | Total Click Count       | Dashboard shows total lifetime clicks and clicks in last 7/30/90 days.   | P0       |
| ANA-02 | Per-Link Clicks         | Each link shows its individual click count in the dashboard.             | P0       |
| ANA-03 | Click Timeline          | Line chart of daily clicks over the selected date range.                 | P0       |
| ANA-04 | Geographic Data         | Choropleth map + top countries table showing where visitors are located. | P1       |
| ANA-05 | Device Breakdown        | Pie chart of Desktop vs Mobile vs Tablet.                                | P1       |
| ANA-06 | Referral Source         | Table showing which platform or URL sent the visitor (UTM-aware).        | P1       |
| ANA-07 | Real-Time Visitors      | Pro users see a live counter of visitors on their page right now.        | P1       |
| ANA-08 | Analytics Export        | Pro users can export a CSV of all click data.                            | P2       |
| ANA-09 | Milestone Notifications | User receives email when they hit 100, 500, 1000, 10000 total clicks.    | P2       |

### 6.5 Custom Domains

| ID     | Feature             | Description                                                                   | Priority |
| ------ | ------------------- | ----------------------------------------------------------------------------- | -------- |
| DOM-01 | Add Custom Domain   | Pro users can point any domain to their LinkFlow page.                        | P1       |
| DOM-02 | DNS Instructions    | Step-by-step DNS setup guide shown in-app (CNAME record).                     | P1       |
| DOM-03 | Auto HTTPS          | SSL certificate provisioned automatically via Let's Encrypt within 5 minutes. | P1       |
| DOM-04 | Domain Verification | System polls DNS until propagation is confirmed and shows status in UI.       | P1       |
| DOM-05 | Remove Domain       | User can detach a custom domain and revert to default slug URL.               | P1       |

### 6.6 Billing & Plans

| Feature                  | Free        | Pro ($9/mo) | Business ($29/mo) |
| ------------------------ | ----------- | ----------- | ----------------- |
| **Active Links**         | 8           | Unlimited   | Unlimited         |
| **Analytics Retention**  | 7 days      | 90 days     | 1 year            |
| **Custom Domain**        | No          | 1 domain    | 5 domains         |
| **Real-Time Analytics**  | No          | Yes         | Yes               |
| **Scheduled Links**      | No          | Yes         | Yes               |
| **Link Sections**        | No          | Yes         | Yes               |
| **Team Members**         | 1           | 1           | Up to 5           |
| **Analytics CSV Export** | No          | No          | Yes               |
| **Priority Support**     | No          | No          | Yes               |
| **LinkFlow Branding**    | Yes (shown) | Removable   | Removed           |

#### Billing Features

| ID      | Feature                 | Description                                                                       | Priority |
| ------- | ----------------------- | --------------------------------------------------------------------------------- | -------- |
| BILL-01 | Stripe Checkout         | User upgrades to Pro/Business via Stripe-hosted checkout.                         | P0       |
| BILL-02 | Subscription Management | User can upgrade, downgrade, or cancel from their settings page.                  | P0       |
| BILL-03 | Billing Portal          | Stripe Customer Portal linked from settings for invoice history and card updates. | P0       |
| BILL-04 | Downgrade Grace Period  | On downgrade to Free, user retains Pro features for remainder of billing cycle.   | P1       |
| BILL-05 | Webhook Handling        | Idempotent Stripe webhook handler for subscription lifecycle events.              | P0       |

---

## 7. Key User Flows

### 7.1 New User Onboarding Flow

| Step | User Action                                         | System Response                                              |
| ---- | --------------------------------------------------- | ------------------------------------------------------------ |
| 1    | Clicks 'Get Started' on homepage                    | Redirected to /signup                                        |
| 2    | Enters email and password (or clicks Google/GitHub) | Account created, verification email sent                     |
| 3    | Clicks verification link in email                   | Email verified, user directed to Onboarding Step 1           |
| 4    | Chooses a unique username                           | System checks availability in real-time; slug reserved       |
| 5    | Adds 1-3 initial links                              | Links saved to DB                                            |
| 6    | Selects a page theme                                | Theme preference saved                                       |
| 7    | Clicks 'Launch My Page'                             | Redirected to /dashboard; page live at linkflow.app/username |

### 7.2 Visitor Click Redirect Flow

This is the most performance-critical path in the entire application. Every millisecond counts.

| Step | System Action                                                      | Latency Target                |
| ---- | ------------------------------------------------------------------ | ----------------------------- |
| 1    | Visitor hits linkflow.app/username                                 | < 100ms (cached CDN response) |
| 2    | Page loads, visitor clicks a link                                  | < 50ms (optimistic redirect)  |
| 3    | Browser redirects to destination URL                               | Immediate (HTTP 301/307)      |
| 4    | Click event queued in BullMQ                                       | Async, non-blocking           |
| 5    | Worker processes click: geo-resolve IP, detect device, write to DB | < 2 seconds                   |
| 6    | Analytics dashboard reflects new click                             | < 5 seconds                   |

### 7.3 Upgrade to Pro Flow

| Step | User Action                                    | System Response                                     |
| ---- | ---------------------------------------------- | --------------------------------------------------- |
| 1    | Hits a Pro-gated feature (e.g., custom domain) | Upsell modal shown with plan comparison             |
| 2    | Clicks 'Upgrade to Pro'                        | Redirected to Stripe Checkout with pre-filled email |
| 3    | Completes payment in Stripe                    | Stripe fires checkout.session.completed webhook     |
| 4    | Webhook handler updates user plan in DB        | User plan set to 'pro'                              |
| 5    | User redirected back to /dashboard             | Pro features unlocked; confirmation toast shown     |

---

## 8. Non-Functional Requirements

### 8.1 Performance

| Requirement                    | Target        | Measurement               |
| ------------------------------ | ------------- | ------------------------- |
| Public page initial load (LCP) | < 1.2 seconds | Vercel Web Analytics      |
| Dashboard initial load         | < 2 seconds   | Lighthouse CI             |
| Redirect latency               | < 100ms P99   | Vercel Edge Logs          |
| Analytics query response       | < 500ms       | API response time headers |
| Database query P95             | < 50ms        | Prisma metrics            |

### 8.2 Security

- All user passwords hashed with bcrypt (cost factor 12)
- JWT tokens expire after 30 days; refresh tokens rotated on each use
- All API inputs validated with Zod schemas server-side
- Rate limiting: 100 requests/minute per IP on public endpoints, 1000/minute for authenticated users
- HTTPS enforced on all routes; HSTS headers enabled
- Content Security Policy (CSP) headers configured
- SQL injection prevention via Prisma parameterized queries (no raw SQL)
- File uploads scanned for MIME type and size (max 5MB); stored in S3 with signed URLs

### 8.3 Reliability & Availability

- Target uptime: 99.9% (< 8.7 hours downtime/year)
- Database: PostgreSQL with automated daily backups, 7-day retention
- Background jobs: BullMQ with retry logic (3 attempts, exponential backoff)
- Graceful degradation: if analytics write queue is backed up, redirects still function
- Error alerting via Sentry with PagerDuty escalation for P0 incidents

### 8.4 Scalability

- Public link pages served from edge CDN (Cloudflare) to minimize origin hits
- Redis caching for public page data with 5-minute TTL; cache invalidated on content update
- Database connection pooling via PgBouncer to handle concurrent connections
- Horizontal scaling via containerized services (Docker + Kubernetes)

### 8.5 Compliance

- **GDPR:** Users can export all their data (JSON) and permanently delete their account
- **CCPA:** Privacy policy clearly discloses data collection and usage
- **CAN-SPAM:** All marketing emails include unsubscribe links
- **Data Residency:** All user data stored in US-East-1 (AWS) by default

---

## 9. Technical Constraints & Assumptions

### 9.1 Constraints

- The platform must be fully functional in Chrome, Firefox, Safari, and Edge (latest 2 versions)
- Mobile-responsive design is required; native app is out of scope for v1.0
- All third-party services (Stripe, Cloudinary, Resend) must have fallback error handling
- Open-source dependencies must be reviewed for known CVEs before inclusion

### 9.2 Assumptions

- Users have a stable internet connection; offline functionality is not required
- The product will be developed by a team of 2–3 engineers for v1.0
- A managed PostgreSQL provider (Supabase or Railway) will be used to reduce ops overhead
- Initial traffic is estimated at < 10,000 DAU; infrastructure will be right-sized accordingly

---

## 10. Release Plan

| Phase         | Milestone              | Key Deliverables                                                                  | Target Date |
| ------------- | ---------------------- | --------------------------------------------------------------------------------- | ----------- |
| Alpha         | Internal team only     | Auth, link management, public page, basic UI                                      | Month 1     |
| Beta (Closed) | 50 invited creators    | Analytics v1, themes, profile customization, Stripe billing                       | Month 2     |
| Beta (Open)   | Public waitlist access | Custom domains, email notifications, onboarding flow polish                       | Month 3     |
| v1.0          | Public launch          | All P0 + P1 features, monitoring, CI/CD, support docs live                        | Month 4     |
| v1.1          | Post-launch hardening  | Performance tuning, bug fixes, P2 features based on user feedback                 | Month 5–6   |
| v2.0          | Planning               | Roadmap for growth: A/B testing, digital products, API access, mobile app scoping | Month 7     |

---

## 11. Risks & Mitigations

| Risk                                   | Likelihood | Impact | Mitigation                                                                 |
| -------------------------------------- | ---------- | ------ | -------------------------------------------------------------------------- |
| Stripe payment failures block upgrades | Low        | High   | Implement webhook retry logic and fallback UI with support contact         |
| Public pages slow under traffic spike  | Medium     | High   | CDN caching + Redis for public pages; load test before launch              |
| Username squatting at launch           | Medium     | Medium | Reserve common brand names; implement report/reclaim flow                  |
| Competitor copies core feature set     | High       | Medium | Focus on speed of analytics and UX quality as moat                         |
| Analytics data loss from queue failure | Low        | Medium | Persistent BullMQ queues backed by Redis AOF; dead-letter queue monitoring |
| GDPR audit / data request at scale     | Low        | High   | Build data export pipeline in Phase 1; document data flows                 |

---

## 12. Open Questions

| #   | Question                                                                                          | Owner             | Status |
| --- | ------------------------------------------------------------------------------------------------- | ----------------- | ------ |
| 1   | Should free users see a 'Powered by LinkFlow' badge on their page? What is the opt-out condition? | Product           | Open   |
| 2   | What is the username reclaim policy if an account is inactive for 12+ months?                     | Product / Legal   | Open   |
| 3   | Do we enforce NSFW content policy at launch? If yes, how — automated or manual review?            | Trust & Safety    | Open   |
| 4   | Should real-time analytics use WebSockets (Socket.io) or Server-Sent Events?                      | Engineering       | Open   |
| 5   | Pricing: Is $9/mo competitive? Should we offer annual billing at 20% discount at launch?          | Product / Finance | Open   |
| 6   | What is the support SLA for Pro users at launch — email only or live chat?                        | Operations        | Open   |

---

## 13. Appendix

### 13.1 Glossary

| Term             | Definition                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| **Slug**         | The unique URL-friendly identifier for a user's page (e.g., linkflow.app/johndoe)                |
| **Click Event**  | A recorded interaction where a visitor clicks a link on a profile page                           |
| **BullMQ**       | A Redis-backed job queue library for processing background tasks                                 |
| **CDN**          | Content Delivery Network — geographically distributed servers that cache and serve static assets |
| **LCP**          | Largest Contentful Paint — a Core Web Vital measuring perceived page load speed                  |
| **MRR**          | Monthly Recurring Revenue — the predictable revenue generated each month from subscriptions      |
| **P0 / P1 / P2** | Priority levels: P0 = must-have for launch, P1 = important, P2 = nice-to-have                    |
| **Soft Delete**  | Marking a record as deleted in the database without permanently removing it, allowing recovery   |
| **TTL**          | Time To Live — the duration a cached item is considered valid before being refreshed             |

### 13.2 Document History

| Version | Date         | Author                             | Changes                                              |
| ------- | ------------ | ---------------------------------- | ---------------------------------------------------- |
| 0.1     | Jan 15, 2025 | Product Manager                    | Initial draft — problem statement and goals only     |
| 0.5     | Feb 01, 2025 | Product Manager                    | Added feature requirements, user flows, and personas |
| 0.8     | Feb 15, 2025 | Product Manager + Engineering Lead | Added NFRs, technical constraints, open questions    |
| 1.0     | Feb 28, 2025 | Product Manager                    | Final review pass; ready for stakeholder sign-off    |

---

## Document Sign-Off

By approving this document, stakeholders confirm alignment on scope, goals, and feature requirements for LinkFlow v1.0.

| Role             | Name | Signature | Date |
| ---------------- | ---- | --------- | ---- |
| Product Manager  |      |           |      |
| Engineering Lead |      |           |      |
| Design Lead      |      |           |      |
| CEO / Founder    |      |           |      |
