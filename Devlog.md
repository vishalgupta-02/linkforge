# This is the logs file of everyday's works

## Day 1 — March 1, 2026

### What I build today?

Monorepo structure was established with the Next.js + Node.js + Postgres with Prisma ORM using pnpm workspace. I was thinking of using a single repo directory like fullstack Next.js but it was quite complicated and I have been using client-server architecture as separate entity.
Added the basic setup after installation of both the ends.
Added config for env validations
Health checkpoints added too for checks.

### What broke and fixed

- Using pnpm workspaces for monorepo was quite... how do I say, easy to setup but when completely understood. Took some time to set it up but was running fine
- The basic setup was done for the start
- added configs with versioning for trying which one is better
- health and one get checkpoint have been added for checks

### What I learned

Learning is the main thing for me. So that's why I am trying new things like monorepo using pnpm workspaces rather client-server architecture. Doing things as a beginner takes time but eventually you will be in better state than the previous one.
Fail-fast validation was quite new for me but easy to implement as you have to pass checks on configs.

## Day 2 — MArch 2, 2026

### What I build today?

PostgreSQL was used in the container in Docker and connected through psql. Ran few queries inside the psql terminal and got to know why ORM or ODM exists. Ran few thinsg to know what's the best and how things work in raw form

### what broke and fixed

- Containers, the word which makes the bones chills down or something modern develoeprs dont want to work or fear it.
- Creating a table like Users, Links, etc. by hands was quite hectic and troublesome. Got few errors and problems while running sql queries as it was first in experience for me
- got to know how psql works but still confused about its functionalities

### What I learned

Why ORM exists. I got to knwo this answer by running sql queries manually inside psql. Hectic and troublesome. Even doing basic stuff like adding data in tables was like doing something impossible but did it anyway and learned so many things.

## Day 3 — March 3, 2026

### What I build today?

Built a register endpoint from scratch, used bcrypt for hashing passwords.
Email duplicate checks and user already exists too. Database is MongoDb is for ease and faster setup

### what broke and fixed

- registering an user is quite tedious task and need to be carefully
- hashed a password using bcrypt library
- checked whether given email is already registered or not
- MOngodb setup done

### what I learned

first time build a register endpoint from scratch and learned behind the scenes how it works, hashed a pssword, and database setup done.

## Day 4 — March 4, 2026

### What I build today?

Developed a login endpoint, generate JWT and doecode the token at jwt.io
Understand iat, exp, payload visibility, httponly cookie storage

### what broke and fixed

the data was sending and token was not generated. dont have to use await before jwt or bcrypt I dont remember but one of them.
checked few things on the internet abotu iat, exp, payload, httponly,etc.

### What I learned

valid user or not check. setting cookies with secure arguments.

## Day 5 — March 5, 2026

### What I build today?

Built auth middleware for verifiation. used JWT.sign on every protected request
Attached user to request
Built GET /me endpoint and also /health too.

### what broke and fixed

thought auth was easy until I implemeted myself from scratch. login was failed and few things.
Middleware works on every request as it will pass from any function

### What I learned

Create a protected request or route.
Attached user related details like id and email to the request object.
Built GET /me endponit, GET /health too for server health.

## Day 6 — March 6, 2026

### What I build today?

logout functionlaity was developed. INderstand tpken balcklist for suitablitity

### What broke and fixed

nothing

### what I learned

- How to use claude and AI for writing things.
- logout button , hwo to rmeove cookies
- Understood redis with more few features.
- token blacklist with redis (not done)
- Refresh token implementation (not done)

## Day 7 — March 7, 2026

- Reviewd everything and done fro the day and maintainign Devlog.md
- readme fiel for auth working

## Day 8 — March 8, 2026

### What I build

Ran the container with postgres. Ran a psql in terminal to access postgres. Wrote sql queries for create, select and upadte data in the database.
Select with where, order by, limit
show myself how indexing helps in fetching data fast and diff. before and after index

### What broke and fixed

not able to write queries by myself, took help from the AI.
want to learn them now. planned a roadmap but didn't follow

### what I learned

- how indexes helps in faster queries
- writing queries by hand is quite troublesome
- used few methods

## Day 9 — March 9, 2026

#### Pending

## Day 10 — March 10, 2026

### What i build ?

Prisma setup was done in backend

### What broke and fixed

Running postgres in container and connecting it to the backend was failed due to the port issues as the local instance was running on the port 5432. It just throws the credentials error everytime I tried connecting to it. Tried few things from the google but didn't worked out. so gave the screenshot to the AI and got the solution. AI can help you to do things faster but can't help you master it. Ran the first migrate and generate command

![alt text](./logs-images/day10.png)

### What i learned

- Understand what sql generates and checked the tables
- first migrations of the project done
- how same ports make running worse if two things

## Day 11 — March 11, 2026

### What i build

Wrote the full schema of the linkfow or Vyrex

### What fixed and broke

Not able to figure the things I should add, relations between different entities but what defined clearly now with some help from AI

### What I learned

- Which entity is related to whichone
- what impacts directly or indirectly
- how much is sufficient and not excessive
- tables visible or not in the studio

## Day 12 — March 12, 2026

#### Pending

## Day 13 — March 13, 2026

#### Pending

## Day 14 — March 14, 2026

### What i build

Added 5 users in the database which covers the maximum scenarios and will be used for testing

### what broke and fixed

the data was inserted wrong and overwritten the headlines such as "User" to "users"
Then tried adding them one by one and before adding took help from the AI too for better precision and correctness.

### what i learned

- how and what to write for the seed data
- used psql to check what data has been inserted

## Day 15 — March 15, 2026

### What I built

Started Better-auth integration in apps/api. Installed the package,
created auth.ts with betterAuth() instance, configured Prisma adapter
with PostgreSQL provider, enabled email/password provider.

### What broke and how I fixed it

- Prisma 7 requires driver adapter — installed @prisma/adapter-pg
  and PrismaPg to fix PrismaClient constructor error
- better-auth/node import not found in v1.5.5 — fixed by checking
  dist folder and using better-auth/integrations/node
- Better-auth generate command failed because PrismaClient had
  empty constructor — fixed by passing datasourceUrl

### What I learned

Prisma 7 is a breaking change from Prisma 6. It no longer accepts
a connection string directly in PrismaClient — requires a driver
adapter specific to your database engine.

## Day 16 — March 16, 2026

### What I built

Connected Better-auth to Express backend. Configured email/password
provider and Google/GitHub OAuth. Email endpoints are live and tested
via Postman.

### What broke and how I fixed it

- better-auth/node import path was wrong for v1.5.5. Fixed by checking
  the dist/integrations folder and using better-auth/integrations/node
- PrismaClient constructor failed in Prisma 7 because it needs a driver
  adapter. Fixed by installing @prisma/adapter-pg and passing it to
  PrismaClient constructor
- Better-auth was looking for plural table names. Fixed by adding
  usePlural: false to prismaAdapter config
- Missing Origin header caused sign-in to fail in Postman. Fixed by
  adding Origin: http://localhost:3000 header
- Auth endpoints can't be tested without the frontend
- Prisma 7 removed the direct connection string from PrismaClient constructor. It now requires a driver adapter like PrismaPg. Always check the generated client file for the correct constructor signature when hitting type errors.

### What I learned

Better-auth splits into server and client packages because the browser
cannot access secrets or the database. The split is a security boundary,
not just organization.

## Day 17 — March 17, 2026

### What I built

Added GitHub OAuth provider to better-auth. Both Google and GitHub
configured in auth.ts with clientId and clientSecret from environment
variables. Backend configuration complete for both providers.

### What broke and how I fixed it

- Social OAuth cannot be tested without a frontend — browser redirect
  flow requires a real URL to redirect back to. Marked as pending
  until frontend is connected.

### What I learned

OAuth is a redirect-based flow. The backend configures the provider
but the actual test requires a browser. You cannot replicate a
redirect flow in Postman.

## Day 18 — March 18, 2026

### What I built

Set up Next.js frontend in apps/web. Created auth-client.ts using
createAuthClient() from better-auth/react. Configured baseURL to
point to Express backend via NEXT_PUBLIC_BACKEND_URL environment
variable.

### What broke and how I fixed it

- toNextJsHandler is not needed in our architecture — that is only
  for when Better-auth runs inside Next.js. We have a separate
  Express backend so the frontend is purely a client.
- NEXT*PUBLIC* prefix required for env variables used in the browser.
  Without it Next.js does not expose them to the client side.

### What I learned

Next.js has two types of environment variables. NEXT*PUBLIC* variables
are sent to the browser. Variables without the prefix stay server-side
only. The split exists because you never want secrets exposed to the
browser.

## Day 19 — March 19, 2026

### What I built

Built login and signup pages in Next.js. Both are client components
using "use client" directive. Connected authClient.signIn.email() and
authClient.signUp.email() to form submissions. Added loading states
and error handling. Login redirects to /dashboard on success.

### What broke and how I fixed it

- CORS error blocked all requests from localhost:3000 to localhost:5000.
  Fixed by adding cors middleware to Express with specific origin and
  credentials: true. Wildcard origin \* does not work with credentials.
- CORS middleware must be first in Express — before Better-auth handler
  and express.json(). Order of middleware matters.
- After login, dashboard returned 404 because the page does not exist
  yet. This is expected — auth is working correctly.

### What I learned

CORS is a browser security mechanism. The browser blocks cross-origin
requests unless the server explicitly allows them. credentials: true
is required for cookies to be sent cross-origin, but it requires a
specific origin — not a wildcard.

## Day 20 — March 20, 2026

### What I build

Build homepage, footr and navbar, onboarding, dashboard using Claude.

### what broke and fixed

The things are static for now and will be using live data soon.

### what i learned

- The AI can help you in doing tasks fast but can't help you master something.
- this thing is the main flaw a vibe coder will always have
- The AI goes down, he goes down as he has the dependency on it and cant do anything without it
- will focus more on learning than copying the designs from it

## Day 21 — March 21, 2026

### What I built

Tested auth flows end to end. Login and signup pages connected to
Express backend. Better-auth session cookie set correctly in browser.
Middleware protecting dashboard routes — unauthenticated users
redirected to login, authenticated users redirected away from
login/signup.

### What broke and how I fixed it

- CORS blocked all requests from localhost:3000 to localhost:5000.
  Fixed by adding cors middleware with specific origin and
  credentials: true. Wildcard origin \* does not work with credentials.
- CORS middleware must be first in Express before all other middleware.
  Order matters — Better-auth handler comes after CORS.
- Dashboard returned 404 after login because page did not exist yet.
  Expected behavior — auth working correctly.

### What I learned

CORS is a browser security feature not a server feature. The browser
enforces it, not the server. credentials: true requires an explicit
origin — never a wildcard. This is a common production mistake that
causes silent auth failures.

## Day 22 — March 22, 2026

### What I built

Set up shared types package at packages/types. Created User, Link,
ApiResponse generic interface, and Plan enum. Wired up @linkflow/types
in both apps/web and apps/api using pnpm workspace:\* protocol.
Both apps now import shared types from one source of truth.

### What broke and how I fixed it

- Package name must match import exactly — changed from 'types' to
  '@linkflow/types' to follow namespace convention and avoid conflicts
  with npm packages.
- pnpm install must be run from monorepo root after adding workspace
  dependency — running it from inside the app folder does not link
  local packages correctly.

### What I learned

In a monorepo, shared types eliminate the problem of frontend and
backend drifting out of sync. When you change a type in packages/types,
TypeScript immediately shows errors in both apps. This is the real
value of a monorepo — not just sharing code but enforcing consistency
across the entire codebase at compile time.

## Day 23 — March 23, 2026

### What I built

Built global error handler in Express. Created AppError custom class.
Added 404 handler for undefined routes. Error responses are consistent
across all endpoints using ApiResponse shape.

### What broke and how I fixed it

- Express 5 wildcard syntax is '/{_path}' not '_' — fixed wildcard 404 handler
- 404 handler must be registered after all routes — order matters in Express

### What I learned

Express error handlers need exactly 4 parameters (err, req, res, next).
Express 5 handles async errors automatically — no asyncHandler wrapper needed.
Stack traces are dangerous in production — they expose file structure and library versions.

## Month 1 Review

✅ Monorepo structure (pnpm workspaces)
✅ Express + TypeScript backend
✅ PostgreSQL + Prisma + Docker
✅ Complete database schema with relations, indexes, cascades
✅ Better-auth with email/password + Google + GitHub OAuth
✅ Next.js frontend with login + signup pages
✅ Auth middleware protecting routes
✅ Shared types package (@linkflow/types)
✅ Global error handler with AppError
✅ Zod validation middleware
✅ API versioning structure
✅ Husky + lint-staged + Commitlint
✅ DEVLOG with 28 days of entries

## Day 24 — March 24, 2026

### What I built

Built Zod validation middleware that validates request body, query params,
and route params separately. Returns consistent error format with field-level
details showing exactly which field failed and why.

### What broke and how I fixed it

- AppError constructor only accepted 2 arguments but validation middleware
  needed to pass error code and metadata. Extended AppError to accept
  optional code and meta parameters.
- Zod errors should pass field-level details to the client even in
  production — validation errors are safe to expose unlike stack traces.

### What I learned

Validation middleware sits between the route definition and the controller.
If validation fails, the request never reaches the controller. This keeps
controllers clean — they can trust that req.body is already validated
and typed correctly.

## Day 25 — March 25, 2026

### What I built

Organized all API routes under /api/v1/ versioning structure. Created
route files for users and auth. Set up index router that mounts v1 routes.
Removed premature v2 routes — versioning is only needed when breaking
changes exist.

### What broke and how I fixed it

- Had v2 routes created before any features were built. Removed them —
  premature versioning adds confusion with no benefit. Add v2 when you
  actually have breaking changes to make.

### What I learned

API versioning exists to protect existing clients when you make breaking
changes. Creating v2 before v1 features exist is premature optimization.
Start with v1 and add v2 only when you need it.

## Day 26 — March 26, 2026

### What I built

Separated config into base, development, production and test environments.
Each environment has its own LOG_LEVEL and SHOW_STACK_TRACES setting.
index.ts merges base config with environment-specific config at startup.

### What broke and how I fixed it

- Was putting all variables in one file — restructured into separate files
  with only environment-specific differences in each file
- NODE_ENV and PORT should not use getEnvVariable because they have
  sensible defaults and should never crash the server if missing

### What I learned

Base config holds shared required variables. Environment configs hold
only what differs. Merging them at runtime with spread operator gives
you one clean config object the rest of the app uses.

## Day 27 — March 27, 2026

### What I built

Set up Husky pre-commit hooks, lint-staged, and Commitlint across the
monorepo. Every commit now runs ESLint and Prettier on staged files.
Every commit message is validated against conventional commits format.
Bad commit messages are rejected automatically.

### What broke and how I fixed it

- ESLint not configured in apps/api — only apps/web had it. Created
  eslint.config.mjs in apps/api with typescript-eslint support.
- lint-staged config was trying to run eslint from root with wrong
  command — fixed by configuring correct file patterns per workspace.
- Commitlint config needed .mjs extension for ES module syntax to work
  correctly regardless of package.json type setting.

### What I learned

Conventional commits format (feat:, fix:, chore:, docs:) forces you to
think about what you are actually doing before committing. It makes git
history readable and enables automated changelog generation. A commit
message like "added stuff" is a sign you do not know what you built.

## Day 28 — March 28, 2026

### What I built

First Cal.com code reading session. Spent 30 minutes reading their
auth implementation and overall monorepo structure on GitHub.

### What I observed

1. Same: Cal.com uses monorepo with packages/ for shared code —
   exactly like our @linkflow/types setup. Validating to see the
   same pattern used at scale.
2. Different: They use tRPC for type-safe APIs instead of REST.
   tRPC eliminates manual type definitions between frontend and
   backend. We chose REST because it is simpler, more universal,
   and easier to debug with Postman.
3. Different architecture: They use NextAuth because their entire
   app lives inside Next.js. We separated frontend and backend
   which is why we use Better-auth on Express. Different
   architecture requires different tools.

### What I learned

Architecture decisions are not right or wrong — they are tradeoffs.
Cal.com chose tRPC for type safety at the cost of complexity. We
chose REST for simplicity at the cost of manual type definitions.
Understanding why a team made a decision matters more than knowing
what decision they made.

## Day 29 — March 29, 2026

### What I built

Buffer and catch-up day. Reviewed everything built in Month 1.
Verified all systems working together: Docker containers running,
Prisma migrations applied, Better-auth endpoints responding,
Next.js frontend connecting to Express backend, middleware
protecting routes correctly.

### What I verified

- POST /api/auth/sign-up/email — working
- POST /api/auth/sign-in/email — working
- Session cookie set correctly in browser
- Dashboard redirects unauthenticated users to login
- Login redirects authenticated users to dashboard
- Global error handler returning consistent ApiResponse shape
- Zod validation middleware rejecting invalid inputs
- Commitlint rejecting non-conventional commit messages

### What I learned

Taking a day to verify everything works end to end before starting
new features is not wasted time. It is how you avoid building Month 2
features on a broken foundation.

## Day 30 — March 30, 2026

### What I built

Read Cal.com codebase for second time focusing on their API structure.
Reviewed Month 1 work and identified gaps to close before Month 2.
Cleaned up commented-out code in route files.

### What I observed from Cal.com

Their API routes follow a consistent pattern — each route file has
its own validation schema, controller, and service. Separation of
concerns applied consistently across every feature. No route handler
contains business logic directly.

### What I learned

Consistency in structure matters more than the specific structure
you choose. Cal.com's codebase is readable because every feature
follows the same pattern. A new developer can look at one feature
and immediately understand all others.

## Day 31 — March 31, 2026

### What I built

Month 1 complete. Final review and cleanup. Committed all pending
changes. DEVLOG up to date for all 31 days.

### Month 1 summary — what I built

- Monorepo with pnpm workspaces
- Express + TypeScript backend
- PostgreSQL + Prisma + Docker
- Complete database schema with 7 models
- Better-auth with email/password + Google + GitHub OAuth
- Next.js frontend with login and signup pages
- Auth middleware protecting all dashboard routes
- Shared types package @linkflow/types
- Global error handler with AppError class
- Zod validation middleware
- API versioning structure /api/v1/
- Husky + lint-staged + Commitlint

### What I learned this month

The foundation is invisible to users but everything depends on it.
Every developer who skips the foundation spends Month 2 fixing
Month 1 mistakes. I did not skip it.

### What Month 2 brings

First real features: user profiles, link management, public pages.
LinkFlow starts looking like a product.

# Month 2 BEGINS

## Day 32 — April 1, 2026

### What I built

Complete username system. Auto-generates username from user's name on
registration. Handles collisions with retry loop up to 5 attempts.
Falls back to user\_${id.slice(0,8)} if all attempts fail. Username
stored in both original and lowercase form for case-insensitive
uniqueness checks.

### What broke and how I fixed it

- databaseHook was calling prisma.user.create() but Better-auth already
  created the user record in the same table due to @@map("user").
  Fixed by changing to prisma.user.update() instead.
- While loop condition was inverted — was looping while username was
  available instead of while taken. Fixed by adding ! to invert result.
- Unique constraint error on id because hook was firing on existing users
  from previous test registrations. Fixed by cleaning database and
  testing with fresh emails.

### What I learned

When Better-auth and your app share the same table via @@map, Better-auth
owns the create operation. Your hook should only update — never create.
databaseHooks fire for every registration method automatically — email,
Google, GitHub. Write the logic once, it works everywhere.

## Day 33 — April 2, 2026

### What I built

Created a public endpoint for accessing profile of the username which returns public profile + active links

### what broke and how I fixed it

Production is so hard to manage, I am not able to do anything without the help of AI. Even public routes was quite difficult, you have to think about everything. I am quite anxious too.

### What I learned

You need to practice so much in the ground, so that the real battle or fight looks like a game or easy to tackle. Facing situations beforehand makes you capable of thinking again if you faced the similar situations in your life.

## Day 34 — April 3, 2026

**Problem:** `request.user` not recognized on Express `Request` type.

**Fixes applied:**

- Optional chaining on assignment → removed
- `"types": ["node"]` blocking Express types → removed
- `import "express"` in `.d.ts` making it a module → removed
- `exactOptionalPropertyTypes` needed explicit `| undefined`
- Route changed to `/profile`
- `include` belongs top-level in tsconfig, not inside `compilerOptions`

**PATCH /profile debugging:**

- Empty body threw "Invalid input" → Zod schema was fine, bug was elsewhere
- `req.body` was `undefined` → missing `Content-Type: application/json` in Postman
- `express.json()` was after auth handler → moved above it
- Select had `username` → schema field is `userName`
- Select had `displayName` → schema field is `name`
- Empty body now returns 200 ✅
- Added `avatarUrl` to select

**Decisions:**

- `userId` never from request body — always from `req.user`
- Email excluded from PATCH — set once, not changeable
- `avatarUrl` included in response select
- avatarUrl does not exists, but image does so used that

## Day 35 — April 4, 2026
