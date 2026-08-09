# LinkFlow — 6-Month Developer Roadmap

**Start:** March 1, 2026 | **End:** September 1, 2026

Your journey to the top 1% of developers in the world.

## 6-Month Day-by-Day Roadmap

**From Zero to Top 1% Developer | March 1 → September 1, 2026**

### YOUR COMMITMENT

Every day you open this document, you are one step closer to being the developer no company can resist. The plan is complete. The only variable is you.

### THE RULE

Build it yourself first. Break it intentionally. Fix it. Write about it. Repeat.

### DAILY RHYTHM

- 45 min build
- 15 min read the docs of what you used
- 15 min break it or test it
- 15 min read one GitHub issue from that library

| Month   | Theme                            | Milestone                                                            |
| ------- | -------------------------------- | -------------------------------------------------------------------- |
| Month 1 | Foundation — Auth + Database     | Raw auth built. PostgreSQL + Prisma working. Better-auth integrated. |
| Month 2 | Core Features — Links + Profiles | Public link pages live. Link management working end to end.          |
| Month 3 | Analytics + Performance          | Click tracking, Redis caching, BullMQ jobs, analytics dashboard.     |
| Month 4 | Production Hardening             | Stripe payments, emails, Docker, CI/CD, deployed to Vercel.          |
| Month 5 | Observability + Break Days       | Sentry, Grafana, load testing. 6 production scenarios practiced.     |
| Month 6 | Polish + Interview Prep          | 1% features, open source PR, blog posts, mock interviews.            |

---

## MONTH 1 | March 1 – March 31, 2026

### Foundation

Understand the primitives. Build auth and database from scratch. No shortcuts.

### WEEK 1 | March 1–7

#### Raw Auth + Express Foundation

**Goal:** Understand JWT, bcrypt, cookies so deeply you could rebuild them from memory

| Day           | Focus                   | What You Build / Learn                                                                                                                      |
| ------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 1 - Mar 1 | Project Setup           | Monorepo structure created. Next.js + Express both running. Health check endpoints live. .env config with fail-fast validation.             |
| Day 2 - Mar 2 | Raw SQL Day             | PostgreSQL running in Docker. Connect via psql. Create Users + Links tables by hand. INSERT, SELECT, JOIN queries written manually. No ORM. |
| Day 3 - Mar 3 | Auth Primitives         | Build register endpoint from scratch. bcrypt hashing. Email duplicate check. MongoDB or PostgreSQL — your choice for this practice app.     |
| Day 4 - Mar 4 | JWT Deep Dive           | Build login endpoint. Generate JWT manually. Decode at jwt.io. Understand iat, exp, payload visibility. httpOnly cookie storage.            |
| Day 5 - Mar 5 | Protected Routes        | Build auth middleware. Verify JWT on every protected request. Attach user to request object. Build GET /me endpoint.                        |
| Day 6 - Mar 6 | Logout + Token Security | Build logout — clear cookie. Understand token blacklist concept with Redis. Implement refresh token mentally (design only today).           |
| Day 7 - Mar 7 | Review + Document       | Review everything you built this week. Write a README explaining how auth works in your own words. This is your first blog post draft.      |

### WEEK 2 | March 8–14

#### PostgreSQL + Prisma Deep Dive

**Goal:** Understand relational databases before letting an ORM abstract them

| Day             | Focus              | What You Build / Learn                                                                                                                                             |
| --------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Day 8 - Mar 8   | PostgreSQL Mastery | Write 10 different SQL queries by hand: SELECT with WHERE, ORDER BY, LIMIT. Practice JOINs. Create indexes. Measure query speed before/after index.                |
| Day 9 - Mar 9   | Transactions       | Write a SQL transaction by hand. Understand ACID properties. Simulate a race condition. Fix it with a transaction. This is critical production knowledge.          |
| Day 10 - Mar 10 | Prisma Setup       | Install Prisma in apps/api. Write your first schema.prisma. Run migrations. Understand what SQL Prisma generates — always check with prisma migrate dev.           |
| Day 11 - Mar 11 | Prisma Schema      | Design full LinkFlow schema: User, Link, ClickEvent, Subscription models. Define all relationships, indexes, and constraints in schema.prisma.                     |
| Day 12 - Mar 12 | Prisma Queries     | Write Prisma queries for: find user, create link, get all links for user, count clicks. Compare with raw SQL you wrote on Day 8. Understand what Prisma is hiding. |
| Day 13 - Mar 13 | N+1 Problem        | Deliberately create an N+1 query. Watch it make 100 DB calls instead of 1. Fix it with Prisma include. This is the most common performance bug in production.      |
| Day 14 - Mar 14 | Review + Seed      | Write a database seed script that creates 10 fake users with 5 links each. Use it to populate your local database for testing.                                     |

### WEEK 3 | March 15–21

#### Better-Auth Integration

**Goal:** Integrate real auth into LinkFlow — now you understand exactly what it does

| Day             | Focus              | What You Build / Learn                                                                                                                                 |
| --------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Day 15 - Mar 15 | Better-Auth Setup  | Install better-auth in apps/api. Configure email/password provider. Connect to PostgreSQL via Prisma adapter. Run migrations.                          |
| Day 16 - Mar 16 | Google OAuth       | Add Google OAuth provider. Create Google Cloud project. Configure credentials. Test full OAuth flow — login with Google, get session.                  |
| Day 17 - Mar 17 | GitHub OAuth       | Add GitHub OAuth provider. Same pattern as Google. Test both OAuth flows work simultaneously. Understand the OAuth redirect flow in your network tab.  |
| Day 18 - Mar 18 | Session Management | Understand how better-auth manages sessions. Where are they stored? What is in the session object? How does it compare to raw JWT you built in Week 1? |
| Day 19 - Mar 19 | Frontend Auth      | Connect Next.js frontend to better-auth. Build login page, register page, logout button. Handle loading states and errors properly.                    |
| Day 20 - Mar 20 | Protected Pages    | Build middleware in Next.js that protects routes. Redirect unauthenticated users to login. Redirect authenticated users away from login page.          |
| Day 21 - Mar 21 | Auth Testing       | Manually test every auth flow: register, login, logout, Google OAuth, GitHub OAuth, protected route, invalid token. Fix every bug you find.            |

### WEEK 4 | March 22–31

#### Monorepo Polish + Month 1 Review

**Goal:** Solidify the foundation before building features

| Day             | Focus               | What You Build / Learn                                                                                                                             |
| --------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 22 - Mar 22 | Shared Types        | Move all shared TypeScript types to packages/types. Import them in both web and api. User, Link, ApiResponse types fully defined and shared.       |
| Day 23 - Mar 23 | Error Handling      | Build a global error handler in Express. Consistent error response format across all endpoints. Never expose stack traces in production responses. |
| Day 24 - Mar 24 | Input Validation    | Add Zod validation to every API endpoint. Validate request body, query params, route params. Return clear validation error messages.               |
| Day 25 - Mar 25 | API Structure       | Organize all routes under /api/v1/. Add versioning. Document every endpoint with JSDoc comments. This becomes your API reference.                  |
| Day 26 - Mar 26 | Environment Configs | Separate configs for development, test, production environments. Make sure nothing production-specific runs in development.                        |
| Day 27 - Mar 27 | Git Discipline      | Set up Husky pre-commit hooks. ESLint + Prettier runs before every commit. Commitlint enforces conventional commits. No more messy git history.    |
| Day 28 - Mar 28 | Month 1 Review      | List every concept you learned this month. Write down 5 things that confused you and how you solved them. This becomes your interview story bank.  |
| Day 29 - Mar 29 | Read Cal.com Code   | First Cal.com reading session. Open their GitHub. Find their auth implementation. Compare with yours. What did they do differently and why?        |
| Day 30 - Mar 30 | Buffer Day          | Catch up on anything incomplete from Month 1. No new concepts today. Just finish and polish what exists.                                           |
| Day 31 - Mar 31 | Month 1 Demo        | Run your full app. Register a user, login with Google, see your dashboard. Take a screenshot. This is proof of Month 1.                            |

---

## MONTH 2 | April 1 – April 30, 2026

### Core Features

Build the heart of LinkFlow — link management, profiles, and public pages.

### WEEK 5 | April 1–7

#### User Profiles + Username System

**Goal:** Every user gets a unique public identity

| Day            | Focus              | What You Build / Learn                                                                                                                                                |
| -------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 32 - Apr 1 | Username Setup     | Username chosen at registration. Real-time availability check as user types. Reserved words list (admin, api, login, etc.). Stored in DB.                             |
| Day 33 - Apr 2 | Profile API        | GET /api/v1/users/:username — public endpoint. Returns user profile + active links. No auth required. This powers the public page.                                    |
| Day 34 - Apr 3 | Profile Edit API   | PATCH /api/v1/profile — protected endpoint. Update bio, display name, avatar URL. User can only edit their own profile.                                               |
| Day 35 - Apr 4 | Avatar Upload      | Integrate Cloudinary. Build file upload endpoint. Validate file type and size server-side. Store Cloudinary URL in database. Delete old avatar when new one uploaded. |
| Day 36 - Apr 5 | Profile UI         | Build the profile edit page in Next.js. Form with avatar upload preview, bio field, display name. Connect to API. Show success/error states.                          |
| Day 37 - Apr 6 | Username Change    | Allow username change once per 30 days. Store last_username_change_at. Enforce the limit. Old username becomes available after change.                                |
| Day 38 - Apr 7 | Profile Validation | Bio max 160 chars enforced client and server. Username regex validation (letters, numbers, underscores only). Display name max 50 chars.                              |

### WEEK 6 | April 8–14

#### Link Management

**Goal:** The core of LinkFlow — add, edit, delete, reorder

| Day             | Focus                  | What You Build / Learn                                                                                                                                            |
| --------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 39 - Apr 8  | Link CRUD API          | POST /links — create. GET /links — list all for user. PATCH /links/:id — update. DELETE /links/:id — soft delete. All protected, all validated with Zod.          |
| Day 40 - Apr 9  | Link Ordering          | Add position field to Link model. PATCH /links/reorder — accepts array of link IDs in new order. Update all positions in a single transaction.                    |
| Day 41 - Apr 10 | Link Limits            | Free users: max 8 active links. Check count before creating. Return clear error when limit reached with upgrade prompt message.                                   |
| Day 42 - Apr 11 | Link Toggle            | Toggle link visibility without deleting. is_active boolean. Inactive links don't appear on public page. Active/inactive count shown in dashboard.                 |
| Day 43 - Apr 12 | Link Dashboard UI      | Build link management UI. List all links. Add link form. Edit inline. Delete with confirmation. Toggle visibility switch. Clean and fast.                         |
| Day 44 - Apr 13 | Drag and Drop          | Implement drag-and-drop reordering in the UI. Use @dnd-kit/core library. On drop, call reorder API. Optimistic update — move immediately, sync in background.     |
| Day 45 - Apr 14 | Soft Delete + Recovery | Deleted links stay in DB with deleted_at timestamp. Build GET /links/deleted endpoint. Allow restore within 30 days. Permanent delete after 30 days via cron job. |

### WEEK 7 | April 15–21

#### Public Link Page

**Goal:** The page the whole world sees when they click your link

| Day             | Focus           | What You Build / Learn                                                                                                                                     |
| --------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 46 - Apr 15 | Public Route    | Build /[username] dynamic route in Next.js. Fetch user + links server side. If username not found return 404 page. This is a Server Component.             |
| Day 47 - Apr 16 | Public Page UI  | Avatar, display name, bio, list of link buttons. Mobile-first design. Fast and clean. No JavaScript required to render — pure Server Component.            |
| Day 48 - Apr 17 | Link Redirect   | Each link click goes through GET /api/v1/r/:linkId — records the click, returns redirect to destination URL. Redirect must be instant — tracking is async. |
| Day 49 - Apr 18 | SEO Basics      | Add generateMetadata to the public page. Dynamic title, description, Open Graph image using the user's avatar. Test with opengraph.xyz.                    |
| Day 50 - Apr 19 | Theme System    | 8 built-in themes. Store theme preference in user profile. Apply theme class to public page. Themes control background, button style, font color.          |
| Day 51 - Apr 20 | Theme Picker UI | Build theme picker in dashboard. Live preview of how the public page looks with each theme. Save selection to API.                                         |
| Day 52 - Apr 21 | Social Icons    | Add social profile URLs to user profile (Instagram, Twitter, LinkedIn, YouTube, TikTok). Render as icon buttons below bio on public page.                  |

### WEEK 8 | April 22–30

#### Month 2 Polish + Testing

**Goal:** Make it bulletproof before moving to analytics

| Day             | Focus              | What You Build / Learn                                                                                                                                         |
| --------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 53 - Apr 22 | Error Boundaries   | Add React error boundaries around key UI sections. Build a proper 404 page. Build a 500 error page. Never show a blank white screen to users.                  |
| Day 54 - Apr 23 | Loading States     | Every API call has a loading state. Skeleton loaders on the dashboard. Buttons disabled while requests are in flight. No double-submit bugs.                   |
| Day 55 - Apr 24 | Mobile Testing     | Open your app on your phone. Fix every layout issue. Test on Chrome mobile devtools for iPhone SE, iPhone 14, Pixel 7 sizes.                                   |
| Day 56 - Apr 25 | API Rate Limiting  | Add rate-limiter-flexible to Express. 100 requests/minute per IP on public endpoints. 1000/minute for authenticated users. Return 429 with retry-after header. |
| Day 57 - Apr 26 | Helmet Security    | Add Helmet.js to Express. Configure CSP headers. Remove X-Powered-By header. Enable HSTS. Run securityheaders.com scan on your API.                            |
| Day 58 - Apr 27 | CORS Configuration | Proper CORS setup — only allow your frontend domain. Not wildcard \*. Test that other origins are rejected. This is a real security concern.                   |
| Day 59 - Apr 28 | First Vitest Tests | Write 5 unit tests for your service layer. Test: create user, hash password, validate link URL, check link limit, reorder links. Run with pnpm test.           |
| Day 60 - Apr 29 | Read Cal.com Code  | Second Cal.com reading session. Find how they handle their booking page — similar to your public link page. What performance techniques do they use?           |
| Day 61 - Apr 30 | Month 2 Demo       | Full flow: register, setup profile, add 5 links, customize theme, open public page. Share the URL with one real person. Get feedback.                          |

---

## MONTH 3 | May 1 – May 31, 2026

### Analytics + Performance

Build the feature that makes LinkFlow different. Learn caching and job queues.

### WEEK 9 | May 1–7

#### Click Tracking Without Caching

**Goal:** Feel the pain before the solution

| Day            | Focus                | What You Build / Learn                                                                                                                                        |
| -------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 62 - May 1 | Click Event Model    | Add ClickEvent table to Prisma schema: linkId, userId, ipAddress, userAgent, country, device, referrer, createdAt. Run migration.                             |
| Day 63 - May 2 | Synchronous Tracking | First version: track clicks synchronously in the redirect handler. Write to DB before redirecting. Deploy and test. Measure redirect latency.                 |
| Day 64 - May 3 | Feel The Pain        | Use k6 to send 500 concurrent requests to your redirect endpoint. Watch the latency. Check DB query times. Your redirects are now slow. Document the numbers. |
| Day 65 - May 4 | IP Geolocation       | Use geoip-lite package to resolve IP address to country. Parse user-agent to detect device type (mobile/desktop/tablet). Add browser detection.               |
| Day 66 - May 5 | Referrer Parsing     | Parse the Referer header. Detect source: Instagram, Twitter, Direct, Google, Other. Store clean source name not raw URL.                                      |
| Day 67 - May 6 | Analytics Queries    | Write Prisma queries for: total clicks, clicks by day, clicks by country, clicks by device, clicks by link. These power your dashboard.                       |
| Day 68 - May 7 | Analytics API        | GET /api/v1/analytics — returns all analytics data for authenticated user. Accepts date range query params. Protected endpoint.                               |

### WEEK 10 | May 8–14

#### Redis Caching

**Goal:** Make public pages blazing fast

| Day             | Focus               | What You Build / Learn                                                                                                                                               |
| --------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 69 - May 8  | Redis Connection    | Connect to Redis using ioredis. Test connection. Write and read a simple key-value pair manually. Understand Redis data types: strings, hashes, lists, sets.         |
| Day 70 - May 9  | Cache-Aside Pattern | Build cache layer for public profile pages by hand. Check Redis first → miss → query DB → store in Redis → return. Measure latency before and after.                 |
| Day 71 - May 10 | Cache Invalidation  | When user updates their profile or links, invalidate the cache. Use a consistent cache key pattern. Test that changes appear immediately after update.               |
| Day 72 - May 11 | TTL Strategy        | Set 5-minute TTL on public page cache. Understand what happens when 1000 users request a just-expired cache key simultaneously — cache stampede. Research solutions. |
| Day 73 - May 12 | Cache Stampede Fix  | Implement probabilistic early expiration or a mutex lock pattern to prevent cache stampede. This is senior-level knowledge most developers never learn.              |
| Day 74 - May 13 | Analytics Caching   | Cache analytics query results with 60-second TTL. Analytics don't need to be real-time for free users. Pro users get shorter TTL.                                    |
| Day 75 - May 14 | Load Test Again     | Re-run your k6 load test from Day 64 with caching enabled. Compare numbers. Document the improvement. This is your first performance case study.                     |

### WEEK 11 | May 15–21

#### BullMQ Job Queue

**Goal:** Make redirects instant by tracking clicks asynchronously

| Day             | Focus                | What You Build / Learn                                                                                                                                            |
| --------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 76 - May 15 | BullMQ Setup         | Install BullMQ. Create a click-tracking queue backed by Redis. Understand Queue vs Worker vs Job concepts.                                                        |
| Day 77 - May 16 | Async Click Tracking | Move click tracking from synchronous to async. Redirect instantly. Add click event to BullMQ queue. Worker processes it in background. Measure new latency.       |
| Day 78 - May 17 | Worker Process       | Build a dedicated worker file that processes click events. Geo-resolve IP, parse user agent, write to database. Worker runs as separate process.                  |
| Day 79 - May 18 | Job Retry Logic      | Configure retry with exponential backoff. 3 attempts. What happens if the DB is down? Jobs wait and retry. Test this by stopping your DB container mid-load.      |
| Day 80 - May 19 | Dead Letter Queue    | Failed jobs after 3 retries go to a dead-letter queue. Build an admin endpoint to inspect failed jobs. This is how you debug production job failures.             |
| Day 81 - May 20 | Queue Monitoring     | Add Bull Board — a web UI for monitoring your queues. See job counts, processing times, failed jobs. Install and connect to your BullMQ instance.                 |
| Day 82 - May 21 | Graceful Shutdown    | Handle SIGTERM in your worker. Finish processing current job before shutdown. Never lose a job mid-process during deployment. Critical for zero-downtime deploys. |

### WEEK 12 | May 22–31

#### Analytics Dashboard UI

**Goal:** Visualize the data you've been collecting

| Day             | Focus                   | What You Build / Learn                                                                                                                                                       |
| --------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 83 - May 22 | Dashboard Layout        | Build analytics dashboard page. Date range selector (7/30/90 days). Summary cards: total clicks, unique visitors, top link, top country.                                     |
| Day 84 - May 23 | Click Timeline Chart    | Line chart of daily clicks using Recharts. Fetch data from analytics API. Loading skeleton while data loads. Empty state when no data yet.                                   |
| Day 85 - May 24 | Per-Link Analytics      | Each link in dashboard shows its click count and percentage of total. Sort by most clicked. Visual bar showing relative performance.                                         |
| Day 86 - May 25 | Geographic Data         | Table of top 10 countries with click counts and percentage. Flag emoji for each country. Sort by most clicks.                                                                |
| Day 87 - May 26 | Device Breakdown        | Pie chart: Desktop vs Mobile vs Tablet percentages using Recharts. Simple and clear. Mobile-first design for the dashboard itself.                                           |
| Day 88 - May 27 | Referral Sources        | Table of top referral sources. Instagram, Twitter, Direct, Google, Other. Help users understand where their audience comes from.                                             |
| Day 89 - May 28 | Real-Time Visitor Count | Pro feature: live counter of visitors on page right now. Use Server-Sent Events (SSE) — simpler than WebSockets for one-way data. Increment on visit, decrement after 5 min. |
| Day 90 - May 29 | TanStack Query          | Replace all raw fetch calls in your analytics dashboard with TanStack Query. Automatic background refetch. Stale-while-revalidate. Proper loading and error states.          |
| Day 91 - May 30 | Read Cal.com Code       | Third Cal.com session. Find their analytics implementation. How do they handle event tracking? What can you improve in your own implementation?                              |
| Day 92 - May 31 | Month 3 Demo            | Full analytics flow: click your links 50 times from different devices. Open dashboard. See charts populated with real data. Take a screenshot.                               |

---

## MONTH 4 | June 1 – June 30, 2026

### Production Hardening

Payments, emails, Docker, CI/CD. Ship something real to the internet.

### WEEK 13 | June 1–7

#### Stripe Payments

**Goal:** Monetize LinkFlow — the real engineering challenge

| Day            | Focus            | What You Build / Learn                                                                                                                                                      |
| -------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 93 - Jun 1 | Stripe Setup     | Create Stripe account. Install stripe npm package. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to .env. Create Pro and Business products in Stripe dashboard.           |
| Day 94 - Jun 2 | Checkout Session | POST /api/v1/billing/checkout — create Stripe Checkout session for Pro plan. Return checkout URL. Frontend redirects user to Stripe-hosted checkout page.                   |
| Day 95 - Jun 3 | Webhook Handler  | POST /api/v1/billing/webhook — handle Stripe events. checkout.session.completed: upgrade user plan. subscription.deleted: downgrade to free. Verify signature always.       |
| Day 96 - Jun 4 | Idempotency      | Stripe can fire the same webhook twice. Your handler must be idempotent — processing the same event twice should not create duplicate upgrades. Add event ID deduplication. |
| Day 97 - Jun 5 | Billing Portal   | GET /api/v1/billing/portal — create Stripe Customer Portal session. User can manage subscription, update card, view invoices. Return portal URL.                            |
| Day 98 - Jun 6 | Plan Enforcement | Check user plan in every Pro-gated feature. Middleware that reads plan from DB. Return 403 with upgrade message for free users hitting Pro features.                        |
| Day 99 - Jun 7 | Billing UI       | Build pricing page with plan comparison table. Upgrade button flows to Stripe checkout. Settings page with current plan, next billing date, manage subscription button.     |

### WEEK 14 | June 8–14

#### Email System

**Goal:** Communicate with users professionally

| Day              | Focus                | What You Build / Learn                                                                                                                                       |
| ---------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Day 100 - Jun 8  | Resend Setup         | Create Resend account. Install resend npm package. Add RESEND_API_KEY to .env. Send your first test email via API call. Verify it arrives.                   |
| Day 101 - Jun 9  | React Email          | Install @react-email/components. Build welcome email template in React. Preview it in the React Email dev server. Understand email HTML limitations.         |
| Day 102 - Jun 10 | Welcome Email        | Trigger welcome email on user registration. Queue it via BullMQ — never send email synchronously in a request handler. Test full flow.                       |
| Day 103 - Jun 11 | Upgrade Email        | Send congratulations email when user upgrades to Pro. Include their Pro features summary and a link to their dashboard.                                      |
| Day 104 - Jun 12 | Milestone Emails     | Send email when user hits 100, 500, 1000, 10000 total clicks. Check milestone thresholds in click tracking worker. Only send each milestone once.            |
| Day 105 - Jun 13 | Password Reset Email | Build forgot password flow. Generate secure reset token. Store in DB with 1-hour expiry. Email reset link. Verify token on reset page. Invalidate after use. |
| Day 106 - Jun 14 | Email Testing        | Test every email in dark mode and light mode. Test on Gmail, Outlook, Apple Mail. Fix rendering issues. Email clients are the IE6 of 2024.                   |

### WEEK 15 | June 15–21

#### Docker + Deployment

**Goal:** Make it run anywhere, automatically

| Day              | Focus               | What You Build / Learn                                                                                                                                                        |
| ---------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 107 - Jun 15 | API Dockerfile      | Write Dockerfile for apps/api. Multi-stage build: build stage compiles TypeScript, production stage runs compiled JS. Minimize image size. No dev dependencies in production. |
| Day 108 - Jun 16 | Web Dockerfile      | Write Dockerfile for apps/web. Next.js standalone output mode. Optimized for production. Test that both images build and run locally.                                         |
| Day 109 - Jun 17 | Docker Compose Prod | Create docker-compose.prod.yml. All services: api, web, postgres, redis, nginx. Environment variables from .env. Named volumes for data persistence.                          |
| Day 110 - Jun 18 | Nginx Config        | Configure Nginx as reverse proxy. Route /api/_ to Express container. Route /_ to Next.js container. SSL termination. Gzip compression. Security headers.                      |
| Day 111 - Jun 19 | Deploy to Vercel    | Deploy apps/web to Vercel. Configure environment variables. Set NEXT_PUBLIC_API_URL to your API domain. Verify the frontend loads in production.                              |
| Day 112 - Jun 20 | Deploy API          | Deploy apps/api to Railway or Render. Connect to managed PostgreSQL and Redis. Configure all environment variables. Verify health check endpoint responds.                    |
| Day 113 - Jun 21 | Domain Setup        | Point a real domain to your Vercel deployment. Configure DNS. Verify HTTPS works. Your app is live on the internet with a real domain.                                        |

### WEEK 16 | June 22–30

#### CI/CD Pipeline

**Goal:** Automate everything — never deploy manually again

| Day              | Focus                 | What You Build / Learn                                                                                                                                                           |
| ---------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 114 - Jun 22 | GitHub Actions Basics | Understand GitHub Actions: workflows, jobs, steps, runners. Read the official docs. Don't copy-paste yet — understand the YAML structure first.                                  |
| Day 115 - Jun 23 | Test Pipeline         | Create .github/workflows/test.yml. On every push and PR: install dependencies, run ESLint, run Vitest tests, run TypeScript type check. Must pass before merge.                  |
| Day 116 - Jun 24 | Build Pipeline        | Add build step to CI. Compile TypeScript, build Next.js. If build fails, PR is blocked. You will never merge broken code again.                                                  |
| Day 117 - Jun 25 | Deploy Pipeline       | Create .github/workflows/deploy.yml. On push to main: run tests, build Docker images, push to registry, deploy to production. Automatic. Zero manual steps.                      |
| Day 118 - Jun 26 | Health Check Gate     | After deployment, pipeline pings your health check endpoint. If it returns non-200, pipeline fails and alerts you. Bad deploys are caught in 30 seconds.                         |
| Day 119 - Jun 27 | Rollback Strategy     | Test rolling back a bad deployment. Deploy a broken version intentionally. Watch health check fail. Roll back to previous Docker image. Practice until it takes under 5 minutes. |
| Day 120 - Jun 28 | Read Cal.com Code     | Fourth Cal.com session. Find their CI/CD configuration. What do they test? How do they deploy? What can you add to your pipeline?                                                |
| Day 121 - Jun 29 | Secrets Management    | All secrets in GitHub Secrets — never in code. Rotate your JWT secret and Stripe keys. Update GitHub Secrets. Verify deployment still works.                                     |
| Day 122 - Jun 30 | Month 4 Demo          | Full production demo: register on your live domain, add links, upgrade to Pro with Stripe test card, receive welcome email, check analytics. It's all real now.                  |

---

## MONTH 5 | July 1 – July 31, 2026

### Observability + Break Days

Monitor everything. Break everything. Fix everything. This is where seniors are made.

### WEEK 17 | July 1–7

#### Sentry + Error Tracking

**Goal:** Know what's broken before users tell you

| Day             | Focus                   | What You Build / Learn                                                                                                                                              |
| --------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 123 - Jul 1 | Sentry Setup            | Create Sentry account. Install @sentry/node in api and @sentry/nextjs in web. Configure DSN. Intentionally throw an error. Verify it appears in Sentry dashboard.   |
| Day 124 - Jul 2 | Error Context           | Add user context to Sentry — which user was affected. Add custom tags: plan, username, endpoint. Rich error reports instead of anonymous stack traces.              |
| Day 125 - Jul 3 | Performance Monitoring  | Enable Sentry performance tracing. Set sample rate to 10%. Find your slowest API endpoints. You will be surprised what you discover.                                |
| Day 126 - Jul 4 | Alerts                  | Configure Sentry alerts: email when error rate spikes. Slack/email when a new error type appears. Set up weekly digest. You want to know before users complain.     |
| Day 127 - Jul 5 | Source Maps             | Configure source maps upload to Sentry. Now stack traces show your TypeScript source code, not compiled JavaScript line numbers. Debug 10x faster.                  |
| Day 128 - Jul 6 | First Fake Incident     | Intentionally deploy a bug that causes 500 errors. Watch Sentry alert fire. Fix the bug. Write a 1-paragraph postmortem: what broke, why, how fixed, how prevented. |
| Day 129 - Jul 7 | Error Boundaries Review | Review every place your app can fail. Add Sentry error capture to catch blocks. Never silently swallow errors in production.                                        |

### WEEK 18 | July 8–14

#### Grafana + Prometheus

**Goal:** See your system's health at a glance

| Day              | Focus              | What You Build / Learn                                                                                                                                                     |
| ---------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 130 - Jul 8  | Prometheus Setup   | Add prom-client to Express. Expose /metrics endpoint. Default metrics: CPU, memory, event loop lag, HTTP request counts and durations. Add to Docker Compose.              |
| Day 131 - Jul 9  | Custom Metrics     | Add custom business metrics: active_users_total, links_created_total, clicks_processed_total, queue_depth. These tell the story of your business, not just infrastructure. |
| Day 132 - Jul 10 | Grafana Setup      | Add Grafana to Docker Compose. Connect Prometheus as data source. Build your first dashboard: request rate, error rate, latency P50/P95/P99.                               |
| Day 133 - Jul 11 | Business Dashboard | Build a Grafana dashboard for business metrics: new signups per hour, upgrades today, clicks per minute. This is what a CTO looks at every morning.                        |
| Day 134 - Jul 12 | Alerting Rules     | Set Prometheus alerting rules: alert if error rate > 5% for 5 minutes. Alert if P99 latency > 2 seconds. Alert if queue depth > 1000. Route to email.                      |
| Day 135 - Jul 13 | OpenTelemetry      | Add OpenTelemetry tracing to Express. Trace a full request from API receipt through DB query through Redis through response. See the full picture of where time is spent.  |
| Day 136 - Jul 14 | Logs               | Structured logging with Pino. Every log line is JSON: timestamp, level, requestId, userId, message. Add request ID middleware that traces a request through all log lines. |

### WEEK 19 | July 15–21

#### Break Days — Production Scenarios

**Goal:** The week that separates developers from engineers

#### BREAK DAY RULES

No tutorials. No Stack Overflow for first 30 minutes. Just you, the logs, Sentry, and Grafana. Fix it. Write a postmortem after every scenario. These postmortems are your most valuable interview material.

| Day              | Focus                      | What You Build / Learn                                                                                                                                                                                    |
| ---------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 137 - Jul 15 | Scenario 1: Traffic Surge  | Use k6 to fire 10,000 requests in 60 seconds at your public page endpoint. Watch Grafana. What breaks first? Fix it. Add caching, connection pooling, rate limiting as needed. Document everything.       |
| Day 138 - Jul 16 | Scenario 1 Review          | Write full postmortem for traffic surge scenario. What was the bottleneck? DB connection pool? Memory? CPU? What was your fix? What would you do differently at 100x scale?                               |
| Day 139 - Jul 17 | Scenario 2: Database Down  | Stop your PostgreSQL container while app is running. Watch errors flood Sentry. Implement graceful degradation: serve cached data from Redis. Queue writes for retry. Bring DB back. Verify nothing lost. |
| Day 140 - Jul 18 | Scenario 2 Review          | Postmortem for DB outage. How long did it take to detect? How did users experience it? What was your RTO (recovery time objective)? What data, if any, was lost?                                          |
| Day 141 - Jul 19 | Scenario 3: Memory Leak    | Write a deliberate memory leak in one route handler — store data in a module-level array on every request. Deploy it. Watch memory climb in Grafana. Find it using Node.js heap snapshot. Fix it.         |
| Day 142 - Jul 20 | Scenario 3 Review          | Postmortem for memory leak. How long did it take to affect users? How did you detect it? How did you isolate which code caused it? How do you prevent it in the future?                                   |
| Day 143 - Jul 21 | Scenario 4: Bad Deployment | Deploy a version that has a syntax error in a critical path. Watch health check fail in CI/CD. Practice rolling back to previous Docker image in under 5 minutes. Time yourself.                          |

### WEEK 20 | July 22–31

#### More Break Days + Security Testing

**Goal:** Complete the break day curriculum

| Day              | Focus                       | What You Build / Learn                                                                                                                                                                                     |
| ---------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 144 - Jul 22 | Scenario 5: Data Corruption | Write a script that updates 10 random rows in your DB with invalid data. Restore from backup. Verify integrity. Understand exactly what data was lost between backup and corruption.                       |
| Day 145 - Jul 23 | Scenario 5 Review           | Postmortem for data corruption. How long do backups take? How old was your most recent backup? What is your RPO (recovery point objective)? How do you reduce it?                                          |
| Day 146 - Jul 24 | Scenario 6: Security Breach | Try to SQL inject your own API. Try IDOR — access another user's links by manipulating IDs in API calls. Try XSS in bio field. Document every vulnerability you find.                                      |
| Day 147 - Jul 25 | Scenario 6 Fix              | Fix every vulnerability found on Day 146. Parameterized queries (Prisma already does this). Authorization checks on every endpoint (verify resource belongs to requesting user). Sanitize all user output. |
| Day 148 - Jul 26 | Playwright E2E Tests        | Write 5 Playwright tests for critical flows: register, login, add link, visit public page, upgrade to Pro. These run in CI before every deployment. Never break these flows again.                         |
| Day 149 - Jul 27 | Load Testing Strategy       | Write a proper k6 load test script that simulates realistic user behavior: visit public page, click link, view dashboard. Run it at 100, 500, 1000 concurrent users. Document limits.                      |
| Day 150 - Jul 28 | Read Cal.com Code           | Fifth Cal.com session. How do they handle errors? What monitoring do they use? What tests do they have? Your codebase should be at least as mature as theirs now.                                          |
| Day 151 - Jul 29 | Database Indexes Audit      | Use EXPLAIN ANALYZE on your 5 most common queries. Find any sequential scans. Add indexes where needed. Re-run. Document the query time improvement.                                                       |
| Day 152 - Jul 30 | Connection Pooling          | Add PgBouncer to Docker Compose. Configure connection pooling between your API and PostgreSQL. Test under load — compare DB performance with and without pooling.                                          |
| Day 153 - Jul 31 | Month 5 Review              | List all 6 production scenarios. For each one write: how you detected it, how you fixed it, how long it took, what you would do faster next time. This is your interview story bank.                       |

---

## MONTH 6 | August 1 – September 1, 2026

### Polish + 1% Features + Interview Ready

The final push. Features that separate you from everyone else. Then prove it.

### WEEK 21 | August 1–7

#### Custom Domains

**Goal:** The most impressive technical feature in LinkFlow

| Day             | Focus             | What You Build / Learn                                                                                                                                            |
| --------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 154 - Aug 1 | Domain Model      | Add CustomDomain model to Prisma schema. Fields: domain, userId, verified, verifiedAt, sslProvisioned. One domain per Pro user.                                   |
| Day 155 - Aug 2 | DNS Verification  | When user adds domain, generate a TXT record verification token. Poll DNS with dns.lookup() until TXT record appears. Mark domain as verified.                    |
| Day 156 - Aug 3 | SSL Provisioning  | Use Caddy server or Nginx + Certbot to auto-provision SSL certificates via Let's Encrypt for custom domains. This is genuinely advanced infrastructure work.      |
| Day 157 - Aug 4 | Request Routing   | Incoming request on custom domain → identify which user owns it → serve their public page. Add domain lookup to your public page route logic.                     |
| Day 158 - Aug 5 | Domain UI         | Build custom domain settings UI. Input for domain, DNS instructions, verification status indicator (pending/verified/failed), SSL status.                         |
| Day 159 - Aug 6 | Domain Testing    | Test full flow with a real domain you own. Add it, follow DNS instructions, verify, see your page load on the custom domain with HTTPS.                           |
| Day 160 - Aug 7 | Domain Edge Cases | Handle: domain already taken by another user, domain verification timeout, SSL provisioning failure, domain removal. Every edge case needs a clear error message. |

### WEEK 22 | August 8–14

#### Advanced Features + GDPR

**Goal:** The 1% polish that makes professionals choose you

| Day              | Focus                   | What You Build / Learn                                                                                                                                                           |
| ---------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 161 - Aug 8  | Scheduled Links         | Pro feature: links with active_from and active_until timestamps. Cron job checks every hour, activates/deactivates links automatically. Test with a 5-minute window.             |
| Day 162 - Aug 9  | Link Sections           | Pro feature: group links under section headers. Add LinkSection model. Sections have a title and position. Links belong to a section optionally.                                 |
| Day 163 - Aug 10 | Analytics CSV Export    | Business feature: export all click data as CSV. Stream the response — don't load millions of rows into memory. Use Node.js streams with csv-stringify.                           |
| Day 164 - Aug 11 | GDPR Data Export        | Any user can request all their data as a JSON file. Queue the export job. Email them a download link when ready. Link expires in 24 hours.                                       |
| Day 165 - Aug 12 | Audit Logs              | Log every significant action: link created, link deleted, plan changed, domain added. Store in AuditLog table with userId, action, metadata, timestamp. Never delete audit logs. |
| Day 166 - Aug 13 | Soft Deletes Everywhere | Review every DELETE operation in your codebase. Add deleted_at to all models where data should be recoverable. Hard delete only after 30 days via scheduled job.                 |
| Day 167 - Aug 14 | Account Deletion        | Full account deletion: cancel Stripe subscription, delete all data, clear all caches, anonymize analytics records, send confirmation email. GDPR compliance complete.            |

### WEEK 23 | August 15–21

#### Open Source + Blog Posts

**Goal:** Prove your skills to the world

| Day              | Focus             | What You Build / Learn                                                                                                                                                                                |
| ---------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 168 - Aug 15 | Blog Post 1       | Write: 'How I load tested my app and fixed a database bottleneck.' Include real numbers from your k6 tests. Publish on dev.to or your own site.                                                       |
| Day 169 - Aug 16 | Blog Post 2       | Write: 'Building async click tracking with BullMQ — how I went from 200ms to 5ms redirects.' Real benchmark numbers. Real code explanations.                                                          |
| Day 170 - Aug 17 | Blog Post 3       | Write: 'What I learned by intentionally breaking my own production app 6 times.' Cover all 6 break day scenarios. This post will go viral with developers.                                            |
| Day 171 - Aug 18 | Blog Post 4       | Write: 'Building auth from scratch vs using a library — what every developer should understand.' Your Week 1 practice becomes a teaching resource.                                                    |
| Day 172 - Aug 19 | Open Source PR    | Find a bug or documentation issue in one of the libraries you used (Better-auth, BullMQ, Prisma). Fix it. Submit a PR. Even a small contribution proves you read and understand real production code. |
| Day 173 - Aug 20 | Portfolio README  | Write an exceptional README for your LinkFlow repo. Architecture diagram. Tech stack with reasons why. Performance benchmarks. Screenshots. Deployment instructions. This is your resume.             |
| Day 174 - Aug 21 | Read Cal.com Code | Final Cal.com session. You've been reading their code for 6 months. What do you understand now that you didn't in Month 1? Write down 5 things you would do differently in LinkFlow.                  |

### WEEK 24 | August 22 – September 1

#### Interview Preparation + Final Polish

**Goal:** Convert every interview into an offer

| Day              | Focus                | What You Build / Learn                                                                                                                                                                      |
| ---------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 175 - Aug 22 | System Design Story  | Write out your LinkFlow architecture as a system design answer. How would you scale it to 10M users? DB sharding, CDN strategy, queue scaling, caching layers. Practice saying it out loud. |
| Day 176 - Aug 23 | Interview Stories    | For each of the 6 break day scenarios, write a STAR story (Situation, Task, Action, Result). Practice telling each one in under 3 minutes. These answer 80% of senior interview questions.  |
| Day 177 - Aug 24 | Code Review Practice | Review your own oldest code. Write comments on what you would change today. This simulates a code review interview. You should be embarrassed by your Month 1 code — that means you grew.   |
| Day 178 - Aug 25 | Mock Interview 1     | Find a developer friend or use Pramp. Do a full 45-minute technical interview. System design question + coding question. Record it. Watch it back. Fix your weaknesses.                     |
| Day 179 - Aug 26 | Mock Interview 2     | Second mock interview. Different person. Focus on behavioral questions this time. Tell your LinkFlow stories. Practice being specific with numbers and outcomes.                            |
| Day 180 - Aug 27 | Performance Audit    | Run Lighthouse on your public page. Get every score above 90. Fix LCP, CLS, FID issues. Your public page is your product demo — it must be fast.                                            |
| Day 181 - Aug 28 | Security Audit       | Run your app through OWASP ZAP scanner. Fix every medium and high severity issue. Run Snyk on your dependencies. Update any packages with known CVEs.                                       |
| Day 182 - Aug 29 | Final Load Test      | Run your biggest k6 load test ever: 5000 concurrent users. Document what breaks and at what threshold. This is your scalability story for interviews.                                       |
| Day 183 - Aug 30 | The Final Review     | Open your Day 1 commit from March 1. Compare it to where you are today. Write one paragraph about who you were on March 1 and who you are on August 30.                                     |
| Day 184 - Sep 1  | LAUNCH DAY           | Post your project on Twitter, LinkedIn, dev.to, Hacker News Show HN. Share all 4 blog posts. Apply to 5 companies. You are ready. You earned this.                                          |

---

## The Final Note

### REMEMBER THIS

The developers who reach the top 1% are not the ones who knew the most on Day 1. They are the ones who showed up on Day 184.

Every senior engineer you admire has a story that sounds like this:

### THEIR STORY

I had no idea what I was doing. I broke production. I stayed up fixing it. I learned why it broke. I made sure it never broke that way again. I repeated this a hundred times.

That story is what you are writing right now. Day by day. Commit by commit. Break by break.

Six months from today you will walk into any interview with real stories of breaking and fixing production systems. Real performance numbers from load tests you ran yourself. Real architecture decisions you made and defended. Real code that real users used.

That is not a junior developer. That is not even a mid-level developer. That is a person who has been in the fire.

### YOUR EDGE

Most candidates answer interview questions with theory. You will answer with memory. That difference is everything.

---

**Start Date:** March 1, 2026  
**End Date:** September 1, 2026  
**Total Days:** 184

**Your goal:** Top 1% of developers in the world.

Now close this document and go build.
