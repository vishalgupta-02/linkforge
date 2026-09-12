# Production-Grade CI/CD and Sentry Release Management with GitHub Actions, Railway, and Vercel

A production deployment is not simply:

```text
git push
   ↓
server updated
```

A serious deployment pipeline should answer all of these questions:

- Did the code pass the quality gate?
- Which exact commit was deployed?
- Which version of the backend is running?
- Which version of the frontend is running?
- Can Sentry identify the exact deployment that produced an error?
- Can Sentry map minified production code back to TypeScript source?
- Were the correct production secrets used?
- Was the API actually healthy after deployment?
- Was the frontend actually reachable?
- What happens when deployment succeeds but the application is unhealthy?
- How do we recover from a bad deployment?
- Can another engineer understand and reproduce the deployment?

This article builds that complete system using:

- GitHub
- GitHub Actions
- GitHub Environments
- Sentry
- Node.js
- Express
- Next.js
- Railway
- Vercel
- Git commit SHA-based releases
- Source maps
- Production health checks

The goal is not merely to deploy an application.

The goal is to build a **traceable, observable, verifiable production delivery pipeline**.

---

# 1. Final Architecture

The system has two independently deployed applications:

```text
Backend
Node.js + Express
        │
        ▼
     Railway
        │
        ▼
  Sentry API Project
```

and:

```text
Frontend
Next.js
        │
        ▼
     Vercel
        │
        ▼
  Sentry Web Project
```

GitHub Actions coordinates both deployments.

The complete flow is:

```text
                         GitHub
                           │
                     push to main
                           │
                           ▼
                 ┌──────────────────┐
                 │   Quality Gate   │
                 │                  │
                 │ ESLint           │
                 │ API tests        │
                 │ Type checking    │
                 │ API build        │
                 │ Web build        │
                 └────────┬─────────┘
                          │
                     PASS ONLY
                          │
                ┌─────────┴─────────┐
                │                   │
                ▼                   ▼
          Railway API          Vercel Web
                │                   │
                ▼                   ▼
          Sentry API            Sentry Web
                │                   │
                └─────────┬─────────┘
                          │
                          ▼
                 Production Health
                      Checks
                          │
                          ▼
                Deployment Successful
```

The most important property is that **every deployment is associated with a Git commit**.

---

# 2. The Core Principle: Deployment Traceability

Suppose production reports:

```text
TypeError: Cannot read properties of undefined
```

An error message alone is not enough.

We want to answer:

```text
When did this start?

Which deployment introduced it?

Which commit introduced that deployment?

Was it frontend or backend?

What source code produced the stack trace?
```

Our system creates this chain:

```text
Production error
      ↓
Sentry event
      ↓
Sentry release
      ↓
Git commit SHA
      ↓
GitHub commit
      ↓
Exact source code
```

That is the foundation of production debugging.

---

# 3. Why Use Git Commit SHA as the Release

There are two common concepts people often confuse:

### Application version

```text
v1.4.2
```

### Deployment identity

```text
9f31b7a...
```

A semantic version can describe a product release.

A Git SHA identifies the exact source state.

For CI/CD, the Git SHA is extremely useful because GitHub already gives us:

```text
github.sha
```

for every workflow execution.

Therefore we do not need a developer to manually change:

```text
1.0.0
1.0.1
1.0.2
```

every time code is deployed.

Instead:

```text
SENTRY_RELEASE=linkforge-api@${{ github.sha }}
```

and:

```text
SENTRY_RELEASE=linkforge-web@${{ github.sha }}
```

---

# 4. Separate Sentry Releases for API and Web

The backend and frontend are separate applications.

Therefore use separate release namespaces.

Backend:

```text
linkforge-api@<commit-sha>
```

Frontend:

```text
linkforge-web@<commit-sha>
```

For example:

```text
linkforge-api@9f31b7a...
linkforge-web@9f31b7a...
```

This prevents ambiguity.

If the frontend crashes:

```text
linkforge-web@...
```

If the API crashes:

```text
linkforge-api@...
```

Even if both originated from the same Git commit, Sentry can distinguish them as separate applications.

---

# 5. GitHub Environments vs Railway Environments

This is an important distinction.

There are multiple systems involved.

## GitHub Environment

We use:

```text
production
```

Its purpose is:

```text
Secrets
Deployment protection
Environment-specific configuration
```

## Railway Environment

Railway also has:

```text
production
```

Its purpose is:

```text
Runtime infrastructure
Deployment target
Environment variables
Service configuration
```

## Vercel Environment

Vercel has:

```text
production
```

which controls the frontend production deployment configuration.

These are different systems.

Conceptually:

```text
GitHub
└── production
    └── GitHub Actions secrets

Railway
└── production
    └── API runtime

Vercel
└── production
    └── Next.js production deployment
```

If GitHub displays something like:

```text
clever-learning/production
```

do not automatically assume it replaces the GitHub `production` environment used by this workflow.

For this architecture, use the existing GitHub:

```text
production
```

environment.

---

# 6. GitHub Production Secrets

The production GitHub environment contains the credentials and URLs required by the deployment pipeline.

The final secret inventory is:

```text
SENTRY_DSN
NEXT_PUBLIC_SENTRY_DSN

RAILWAY_TOKEN
RAILWAY_PROJECT
RAILWAY_SERVICE

VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

API_HEALTH_URL
WEB_URL
```

Configure them under:

```text
GitHub Repository
    ↓
Settings
    ↓
Environments
    ↓
production
    ↓
Environment secrets
```

---

# 7. Secret Responsibility Matrix

A production-grade system should make secret ownership explicit.

| Secret                   | Used for                     |
| ------------------------ | ---------------------------- |
| `SENTRY_DSN`             | Backend Sentry               |
| `NEXT_PUBLIC_SENTRY_DSN` | Frontend Sentry              |
| `RAILWAY_TOKEN`          | Authenticate Railway CLI     |
| `RAILWAY_PROJECT`        | Identify Railway project     |
| `RAILWAY_SERVICE`        | Identify Railway API service |
| `VERCEL_TOKEN`           | Authenticate Vercel CLI      |
| `VERCEL_ORG_ID`          | Identify Vercel account/team |
| `VERCEL_PROJECT_ID`      | Identify Vercel project      |
| `API_HEALTH_URL`         | Locate production API        |
| `WEB_URL`                | Locate production frontend   |

The important security principle is:

**The repository contains references to secrets, not secret values.**

For example:

```yaml
${{ secrets.RAILWAY_TOKEN }}
```

is correct.

This is not:

```yaml
RAILWAY_TOKEN: "actual-token-here"
```

---

# 8. Backend Sentry Configuration

The Express API must initialize Sentry using runtime environment variables.

Conceptually:

```ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
  release: process.env.SENTRY_RELEASE,
});
```

The important variables are:

```text
SENTRY_DSN
SENTRY_ENVIRONMENT
SENTRY_RELEASE
```

The values should come from the deployment environment.

The source code should not contain production credentials.

---

# 9. Backend Configuration Flow

The runtime configuration flows like this:

```text
GitHub Secret
     │
     ▼
GitHub Actions
     │
     ▼
Railway variable
     │
     ▼
Node.js process.env
     │
     ▼
Sentry SDK
```

For example:

```text
GitHub:
SENTRY_DSN
```

becomes:

```text
Railway:
SENTRY_DSN
```

which becomes:

```ts
process.env.SENTRY_DSN;
```

inside the application.

---

# 10. Backend Environment

The production API should use:

```text
SENTRY_ENVIRONMENT=production
```

This tells Sentry that the event originated from production.

This allows Sentry to separate:

```text
development
staging
production
```

instead of mixing all application errors together.

---

# 11. Frontend Sentry Configuration

The Next.js application needs its own Sentry configuration.

Its DSN is:

```text
NEXT_PUBLIC_SENTRY_DSN
```

The frontend should also use:

```text
SENTRY_ENVIRONMENT
SENTRY_RELEASE
```

The exact initialization depends on the Sentry/Next.js integration files in the application, but the important requirement is:

**the Next.js Sentry configuration must actually consume the release and environment values supplied during the production build.**

Simply defining:

```yaml
SENTRY_RELEASE: linkforge-web@${{ github.sha }}
```

in GitHub Actions does not automatically configure Sentry.

The application configuration must use it.

---

# 12. Build-Time vs Runtime Configuration

This distinction is especially important for Next.js.

Some frontend configuration is determined during the build.

Therefore the workflow supplies:

```yaml
NEXT_PUBLIC_SENTRY_DSN: ${{ secrets.NEXT_PUBLIC_SENTRY_DSN }}
SENTRY_ENVIRONMENT: production
SENTRY_RELEASE: linkforge-web@${{ github.sha }}
```

during:

```bash
vercel build --prod
```

The sequence is:

```text
GitHub Actions
      ↓
environment variables
      ↓
Next.js production build
      ↓
Sentry integration
      ↓
production artifact
      ↓
Vercel
```

This is why Sentry configuration cannot be treated as purely runtime configuration for every Next.js feature.

---

# 13. Source Maps: The Missing Piece

A production JavaScript application is often transformed during the build.

TypeScript:

```ts
function calculateTotal(price: number) {
  return price * 1.18;
}
```

does not necessarily remain exactly like that in the browser.

Next.js may perform:

```text
TypeScript
   ↓
transpilation
   ↓
bundling
   ↓
minification
   ↓
production JavaScript
```

An error in the browser might therefore produce a stack trace referring to:

```text
/_next/static/chunks/abc123.js
```

with minified code.

That is difficult for a developer to debug.

Source maps solve this problem.

---

# 14. What Source Maps Do

A source map creates a mapping between:

```text
Compiled/minified JavaScript
```

and:

```text
Original source code
```

Conceptually:

```text
Production bundle
      │
      ▼
Source map
      │
      ▼
Original TypeScript/React
```

Sentry can use those mappings to turn an unreadable production stack trace into something much more useful.

Instead of:

```text
abc123.js:1:28493
```

you can get something closer to:

```text
components/dashboard/chart.tsx:87
```

with the original function and source context.

---

# 15. Why Source Maps and Releases Belong Together

Source maps are associated with a particular build/release.

Consider:

```text
Release A
  ↓
Source maps A
```

and:

```text
Release B
  ↓
Source maps B
```

If you upload the wrong source map to the wrong release, Sentry can map an error to incorrect source code.

Therefore the release identifier needs to be deterministic.

Our release:

```text
linkforge-web@<github-sha>
```

provides that deterministic identity.

The complete lifecycle is:

```text
Git commit
     ↓
Release identifier
     ↓
Production build
     ↓
Source maps
     ↓
Sentry release artifacts
     ↓
Deployment
     ↓
Runtime error
     ↓
Sentry resolves stack trace
```

---

# 16. Sentry Release Lifecycle

There are conceptually several steps in a proper release workflow.

```text
1. Identify release
        ↓
2. Create/associate release
        ↓
3. Build application
        ↓
4. Upload source maps/artifacts
        ↓
5. Deploy application
        ↓
6. Runtime events reference release
```

For the frontend:

```text
linkforge-web@<sha>
```

For the backend:

```text
linkforge-api@<sha>
```

The important principle is that **the release used at runtime must correspond to the release associated with the uploaded artifacts/source maps.**

---

# 17. Sentry Source Map Security

Source maps can contain information about your source structure.

They should therefore be treated as deployment artifacts rather than something casually exposed publicly.

A production Sentry setup should ensure:

```text
Source maps
     ↓
Sentry
     ↓
Developer debugging
```

rather than unnecessarily making them public assets.

The goal is:

```text
Browser receives production bundle
Sentry receives source map
Developer receives readable stack trace
```

---

# 18. Railway Configuration

The API deployment uses Railway.

The workflow first configures the Sentry variables:

```yaml
- name: Configure Sentry on Railway
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
  run: |
    railway variable set \
      "SENTRY_DSN=${SENTRY_DSN}" \
      "SENTRY_ENVIRONMENT=${SENTRY_ENVIRONMENT}" \
      "SENTRY_RELEASE=${SENTRY_RELEASE}" \
      --service "${{ secrets.RAILWAY_SERVICE }}" \
      --environment production \
      --project "${{ secrets.RAILWAY_PROJECT }}" \
      --skip-deploys
```

Three runtime variables are written:

```text
SENTRY_DSN
SENTRY_ENVIRONMENT
SENTRY_RELEASE
```

---

# 19. Why `SENTRY_DSN` Must Exist in the GitHub Job

The workflow contains:

```bash
"SENTRY_DSN=${SENTRY_DSN}"
```

The shell needs `$SENTRY_DSN` to exist.

Therefore the job must contain:

```yaml
env:
  SENTRY_ENVIRONMENT: production
  SENTRY_RELEASE: linkforge-api@${{ github.sha }}
  SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
```

Without:

```yaml
SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
```

the shell may receive an empty value.

That could result in Railway receiving:

```text
SENTRY_DSN=
```

The deployment might still technically run, but the API would not have the correct Sentry DSN.

This is a subtle but important CI/CD failure mode.

---

# 20. Why `--skip-deploys` Is Used

The workflow uses:

```text
--skip-deploys
```

when updating Railway variables.

This prevents the variable update itself from triggering a separate deployment.

The workflow intentionally controls the sequence:

```text
Set variables
     ↓
Deploy application
```

rather than:

```text
Set variables
     ↓
Railway automatically deploys
     ↓
Workflow deploys again
```

This gives the GitHub Actions workflow explicit control over the deployment sequence.

---

# 21. Railway Deployment

After configuring variables:

```yaml
- name: Deploy API to Railway
  working-directory: apps/api
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
  run: |
    railway up --ci \
      --service "${{ secrets.RAILWAY_SERVICE }}" \
      --environment production \
      --project "${{ secrets.RAILWAY_PROJECT }}" \
      --message "Deploy ${GITHUB_SHA}"
```

The deployment identifies:

```text
Railway project
       ↓
Railway environment
       ↓
Railway API service
```

and deploys the contents of:

```text
apps/api
```

---

# 22. What `RAILWAY_TOKEN` Does

The Railway token authenticates the CLI.

Conceptually:

```text
GitHub Actions
      │
      │ RAILWAY_TOKEN
      ▼
Railway API
```

The token should never be stored in the repository.

GitHub Actions accesses it using:

```yaml
${{ secrets.RAILWAY_TOKEN }}
```

---

# 23. What `RAILWAY_PROJECT` Does

A Railway account can contain multiple projects.

Therefore the workflow needs to identify the intended project.

```text
RAILWAY_PROJECT
        ↓
Which Railway project?
```

The project ID can be obtained through Railway's project/CLI configuration.

Use:

```bash
railway login
railway link
```

and select the intended project.

Do not confuse the human-readable project name with the identifier required by the CLI.

---

# 24. What `RAILWAY_SERVICE` Does

A Railway project may contain multiple services:

```text
Railway Project
│
├── API
├── Database
└── Redis
```

The deployment must target the API service.

Therefore:

```text
RAILWAY_SERVICE
        ↓
API service
```

It must not accidentally identify the database or another service.

The Railway CLI can be used to inspect or select the linked service.

---

# 25. Vercel Configuration

The frontend is deployed to Vercel.

The deployment process is:

```text
vercel pull
      ↓
vercel build
      ↓
vercel deploy --prebuilt
```

This is different from simply asking Vercel to build a Git repository independently.

GitHub Actions explicitly builds the production artifact.

---

# 26. VERCEL_TOKEN

The Vercel token authenticates the CLI.

The workflow uses:

```yaml
VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

The token is created from the Vercel account/team token settings.

Store it only as a GitHub secret.

---

# 27. VERCEL_ORG_ID

Vercel needs to know which account or team owns the project.

Run:

```bash
cd apps/web
vercel login
vercel link
```

Vercel creates:

```text
apps/web/.vercel/project.json
```

It contains information similar to:

```json
{
  "orgId": "team_xxxxxxxxx",
  "projectId": "prj_xxxxxxxxx"
}
```

Therefore:

```text
orgId
  ↓
VERCEL_ORG_ID
```

---

# 28. VERCEL_PROJECT_ID

From:

```text
apps/web/.vercel/project.json
```

take:

```text
projectId
```

and store it as:

```text
VERCEL_PROJECT_ID
```

The distinction is:

```text
VERCEL_ORG_ID
      ↓
Which Vercel account/team?

VERCEL_PROJECT_ID
      ↓
Which Vercel project?
```

---

# 29. Why Link Vercel from `apps/web`

This is a monorepo.

The frontend exists at:

```text
apps/web
```

Therefore run:

```bash
cd apps/web
vercel link
```

This ensures the Vercel project metadata belongs to the frontend application.

The resulting file is:

```text
apps/web/.vercel/project.json
```

---

# 30. Vercel Production Environment

The workflow pulls production configuration:

```yaml
- name: Pull Vercel production environment
  working-directory: apps/web
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  run: |
    vercel pull \
      --yes \
      --environment=production \
      --token="$VERCEL_TOKEN"
```

The purpose is to make the Vercel production configuration available to the build.

---

# 31. Vercel Production Build

The workflow provides Sentry configuration during the build:

```yaml
- name: Build Vercel production artifact
  working-directory: apps/web
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
    NEXT_PUBLIC_SENTRY_DSN: ${{ secrets.NEXT_PUBLIC_SENTRY_DSN }}
    SENTRY_ENVIRONMENT: production
    SENTRY_RELEASE: linkforge-web@${{ github.sha }}
  run: |
    vercel build \
      --prod \
      --token="$VERCEL_TOKEN"
```

This creates the production artifact.

The important relationship is:

```text
GitHub SHA
    ↓
SENTRY_RELEASE
    ↓
Next.js build
    ↓
Sentry release/source maps
```

---

# 32. Vercel Prebuilt Deployment

After building:

```yaml
- name: Deploy Vercel production artifact
  working-directory: apps/web
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  run: |
    vercel deploy \
      --prebuilt \
      --prod \
      --token="$VERCEL_TOKEN"
```

The `--prebuilt` flag means the already-created artifact is deployed.

The architecture is therefore:

```text
GitHub Actions
      ↓
vercel build
      ↓
production artifact
      ↓
vercel deploy --prebuilt
      ↓
Vercel
```

---

# 33. Why Build and Deploy Are Separate

Separating build and deployment provides better control.

Build:

```text
Does the application compile?
```

Deployment:

```text
Put this exact artifact into production.
```

This also makes the Sentry release relationship clearer because the artifact is produced in the same controlled CI environment where the release identifier is available.

---

# 34. API_HEALTH_URL

The production API needs a publicly reachable URL.

For example:

```text
https://your-api.up.railway.app
```

Store:

```text
API_HEALTH_URL=https://your-api.up.railway.app
```

Do **not** add `/health`.

The workflow itself performs:

```bash
"$API_HEALTH_URL/health"
```

Therefore:

```text
API_HEALTH_URL
      ↓
https://your-api.up.railway.app
      +
/health
      ↓
https://your-api.up.railway.app/health
```

If you use a custom API domain, use that domain instead.

---

# 35. The `/health` Endpoint

The API must expose a health endpoint.

For example:

```text
GET /health
```

A basic health endpoint might return:

```json
{
  "status": "ok"
}
```

The exact response structure is less important than returning a successful HTTP response when the application is ready to accept traffic.

---

# 36. WEB_URL

`WEB_URL` is the production frontend URL.

For example:

```text
https://your-project.vercel.app
```

or your custom production domain:

```text
https://yourdomain.com
```

Store the base URL:

```text
WEB_URL=https://yourdomain.com
```

The health check then performs:

```bash
curl "$WEB_URL"
```

---

# 37. Why Health Checks Are Necessary

A deployment command succeeding does not prove that the application is healthy.

For example:

```text
Railway deployment
       ↓
SUCCESS
```

does not necessarily mean:

```text
Application
       ↓
READY
```

The process might:

- crash during startup
- fail to connect to a dependency
- have invalid environment variables
- fail migrations
- return errors
- take time to become ready

Therefore the pipeline verifies the actual running service.

---

# 38. API Health Check With Retries

The API health check uses:

```bash
MAX_RETRIES=12
DELAY_SECONDS=5
```

and repeatedly calls:

```bash
"$API_HEALTH_URL/health"
```

The retry behavior is important because a newly deployed service may require several seconds to become ready.

The sequence is:

```text
Attempt 1
   ↓
not ready
   ↓
wait 5 seconds
   ↓
Attempt 2
   ↓
not ready
   ↓
...
   ↓
healthy
```

The pipeline does not immediately declare failure just because startup takes time.

---

# 39. Web Health Check

The frontend is checked with:

```bash
curl \
  --fail \
  --silent \
  --show-error \
  --max-time 10 \
  "$WEB_URL"
```

This confirms that the production frontend is reachable and returns a successful response.

---

# 40. `curl --fail`

The health check uses:

```text
--fail
```

This matters because an HTTP error response should cause the workflow to fail.

Conceptually:

```text
HTTP 200
   ↓
PASS
```

while:

```text
HTTP 500
   ↓
FAIL
```

This makes the health check an actual deployment gate rather than merely a connectivity test.

---

# 41. GitHub Actions Job Dependencies

The quality gate runs first.

```yaml
deploy-api:
  needs: test
```

and:

```yaml
deploy-web:
  needs: test
```

Therefore:

```text
             test
              │
        ┌─────┴─────┐
        ▼           ▼
   deploy-api   deploy-web
        │           │
        └─────┬─────┘
              ▼
        health-check
              │
              ▼
    deployment-success
```

If the quality gate fails:

```text
test
 ↓
FAIL
 ↓
No production deployment
```

This protects production from code that does not pass the basic validation pipeline.

---

# 42. Why the Test Job Does Not Need Sentry Production Secrets

The test job performs:

```text
lint
tests
type checks
build validation
```

It is not deploying production.

Therefore it should not require production credentials such as:

```text
RAILWAY_TOKEN
VERCEL_TOKEN
```

or production deployment-specific Sentry configuration.

This separation follows the principle of least privilege.

```text
Test job
    ↓
validate code

Deployment job
    ↓
deploy code
```

The fewer credentials exposed to a job, the smaller its security blast radius.

---

# 43. Concurrency Protection

The workflow uses:

```yaml
concurrency:
  group: production-deployment
  cancel-in-progress: false
```

This prevents multiple production deployments from running concurrently.

Imagine:

```text
Commit A
   ↓
Deployment begins

Commit B
   ↓
Another deployment begins
```

That can create race conditions.

Instead:

```text
Commit A
   ↓
Deployment
   ↓
Complete

Commit B
   ↓
Deployment
```

The second deployment waits for the production deployment slot.

---

# 44. Why `cancel-in-progress: false`

We do not want an active production deployment to be abruptly cancelled simply because another commit was pushed.

Therefore:

```text
cancel-in-progress: false
```

allows the current deployment to finish.

The next deployment can then proceed.

---

# 45. Failure Scenarios

A production-grade pipeline must define failure behavior.

## Scenario 1 — Tests fail

```text
test
 ↓
FAIL
```

Result:

```text
API deployment: skipped
Web deployment: skipped
```

Production remains unchanged.

---

## Scenario 2 — API deployment fails

```text
test
 ↓
PASS
 ↓
deploy-api
 ↓
FAIL
```

The workflow does not reach a successful final deployment state.

---

## Scenario 3 — Web deployment fails

Same principle:

```text
test
 ↓
PASS
 ↓
deploy-web
 ↓
FAIL
```

The final success job does not run.

---

## Scenario 4 — API deploys but is unhealthy

```text
Railway deployment
       ↓
deployment accepted
       ↓
/health
       ↓
FAIL
       ↓
retry
       ↓
FAIL
```

The health-check job fails.

This is important:

**A deployment being accepted by the platform is not the same thing as the application being healthy.**

---

## Scenario 5 — Frontend deploys but is unreachable

```text
Vercel deployment
       ↓
successful
       ↓
WEB_URL
       ↓
HTTP failure
       ↓
health-check fails
```

Again, the pipeline reports failure.

---

# 46. Deployment Failure vs Application Failure

These should be treated as different events.

### Deployment failure

The platform cannot deploy the artifact.

```text
GitHub
 ↓
Railway/Vercel
 ↓
deployment failure
```

### Runtime failure

The platform accepts the deployment, but the application fails.

```text
GitHub
 ↓
Railway/Vercel
 ↓
deployment success
 ↓
application crashes
```

### Health-check failure

The deployment appears to complete, but the production endpoint is not healthy.

```text
deployment
 ↓
health check
 ↓
FAIL
```

This distinction makes incident diagnosis much easier.

---

# 47. Rollback Strategy

The current health-check pipeline **detects** a bad deployment.

It does not automatically undo it.

That distinction is important.

A pipeline like:

```text
deploy
 ↓
health check
 ↓
FAIL
```

has detected a bad deployment, but detection is not rollback.

Rollback requires returning production to a known-good deployment.

The safest operational model is:

```text
Bad deployment
      ↓
Health check fails
      ↓
Deployment marked failed
      ↓
Identify previous known-good commit
      ↓
Redeploy known-good commit
```

The deployment system should not pretend that a failed health check automatically restores the previous version unless an explicit rollback mechanism has been implemented.

---

# 48. Why Automatic Rollback Is Not Included Here

Automatic rollback sounds attractive:

```text
health check fails
       ↓
rollback automatically
```

But rollback itself can fail.

For example:

```text
bad application
       ↓
rollback
       ↓
database migration incompatibility
       ↓
rollback also fails
```

Database schema changes are especially important.

Therefore the current pipeline deliberately establishes a strong foundation:

```text
Quality gate
+
Deployment
+
Observability
+
Health verification
```

Rollback can then be designed around the application's actual compatibility and migration strategy.

---

# 49. Database Migrations and Rollback

Application rollback becomes more complicated when deployments modify the database schema.

Suppose deployment A uses:

```text
Database schema A
Application A
```

and deployment B introduces:

```text
Database schema B
Application B
```

If schema B is destructive, simply rolling the application back to A may not work.

Therefore production database migrations should generally be designed with backward compatibility in mind.

A mature deployment sequence often looks like:

```text
Expand
  ↓
Deploy application
  ↓
Migrate traffic
  ↓
Contract later
```

rather than:

```text
Destroy old schema
  ↓
Deploy new application
```

This is a broader deployment concern, but it becomes critical when designing real rollback systems.

---

# 50. Sentry Error Verification

After deployment, verify that Sentry is actually receiving production errors.

Do not assume:

```text
Sentry package installed
```

means:

```text
Sentry observability works
```

The complete verification should confirm:

```text
Application
    ↓
Sentry SDK
    ↓
Sentry event
    ↓
production environment
    ↓
correct release
    ↓
readable source location
```

---

# 51. Backend Sentry Verification

Trigger a controlled backend error in a safe way.

Then inspect Sentry.

You should see something equivalent to:

```text
Environment:
production

Release:
linkforge-api@<github-sha>
```

The event should contain a useful stack trace.

---

# 52. Frontend Sentry Verification

Perform the same controlled verification for the frontend.

The Sentry event should show:

```text
Environment:
production

Release:
linkforge-web@<github-sha>
```

The stack trace should resolve to the original source where source maps are configured correctly.

---

# 53. How to Verify Source Maps

A successful source-map setup should turn something like:

```text
main-8a7c3.js:1:93847
```

into a useful source location such as:

```text
components/dashboard/chart.tsx:87
```

The exact display depends on the build and Sentry integration, but the principle is:

```text
Minified bundle
       ↓
Sentry source maps
       ↓
Original source
```

If Sentry shows only minified locations, investigate the release/artifact/source-map configuration.

---

# 54. Release Consistency

A very important invariant is:

```text
Runtime release
       ==
Sentry artifact release
```

For example:

```text
Runtime:
linkforge-web@9f31b7a
```

should correspond to the artifacts uploaded for:

```text
linkforge-web@9f31b7a
```

Not:

```text
linkforge-web@8ac1234
```

This is why deterministic release identifiers matter.

---

# 55. The Complete Release Chain

For a frontend deployment:

```text
Git commit
     ↓
github.sha
     ↓
linkforge-web@github.sha
     ↓
Next.js production build
     ↓
source maps/artifacts
     ↓
Sentry release
     ↓
Vercel deployment
     ↓
runtime error
     ↓
Sentry event
     ↓
source-mapped stack trace
```

For the backend:

```text
Git commit
     ↓
github.sha
     ↓
linkforge-api@github.sha
     ↓
Railway environment
     ↓
Express application
     ↓
Sentry event
```

---

# 56. Why This Is Better Than Manually Managed Versions

Consider a team that manually updates:

```text
VERSION=1.0.1
```

Every time.

Someone can forget.

Someone can deploy code without changing the version.

Two deployments can accidentally share the same version.

Git SHA avoids these problems.

Every commit already has a unique identity.

Therefore:

```text
Commit
   ↓
Release
```

is automatic.

---

# 57. Production Secret Flow

The complete secret architecture is:

```text
                    GitHub
              production Environment
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
     Railway                        Vercel
        │                             │
        ▼                             ▼
      API                            Web
        │                             │
        ▼                             ▼
 Sentry API Project             Sentry Web Project
```

GitHub acts as the deployment orchestrator.

Railway and Vercel remain the runtime platforms.

Sentry remains the observability platform.

---

# 58. Complete GitHub Production Environment

The final GitHub `production` environment should contain:

```text
SENTRY_DSN
NEXT_PUBLIC_SENTRY_DSN

RAILWAY_TOKEN
RAILWAY_PROJECT
RAILWAY_SERVICE

VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

API_HEALTH_URL
WEB_URL
```

The values themselves should remain secret where appropriate.

---

# 59. Complete Deployment Workflow

The resulting workflow has the following structure:

```yaml
name: Deploy

on:
  push:
    branches:
      - main

concurrency:
  group: production-deployment
  cancel-in-progress: false

permissions:
  contents: read

env:
  NODE_VERSION: 24

jobs:
  # ============================================================
  # 1. QUALITY GATE
  # ============================================================
  test:
    name: Test & Build Validation
    runs-on: ubuntu-latest

    env:
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/linkforge_test?schema=public"
      NEXT_PUBLIC_BACKEND_URL: "http://localhost:5000"
      NEXT_TELEMETRY_DISABLED: "1"

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma Client
        run: pnpm --filter api exec prisma generate

      - name: Run ESLint
        run: pnpm lint

      - name: Run API tests
        run: pnpm --filter api exec vitest run

      - name: Type check API
        run: pnpm --filter api exec tsc --noEmit

      - name: Type check Web
        run: pnpm --filter web exec tsc --noEmit

      - name: Build API
        run: pnpm --filter api build

      - name: Build Web
        run: pnpm --filter web build

  # ============================================================
  # 2. DEPLOY API TO RAILWAY
  # ============================================================
  deploy-api:
    name: Deploy API to Railway
    runs-on: ubuntu-latest
    needs: test

    environment:
      name: production

    env:
      SENTRY_ENVIRONMENT: production
      SENTRY_RELEASE: linkforge-api@${{ github.sha }}
      SENTRY_DSN: ${{ secrets.SENTRY_DSN }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Railway CLI
        run: pnpm add --global @railway/cli@5.47.1

      - name: Configure Sentry on Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          railway variable set \
            "SENTRY_DSN=${SENTRY_DSN}" \
            "SENTRY_ENVIRONMENT=${SENTRY_ENVIRONMENT}" \
            "SENTRY_RELEASE=${SENTRY_RELEASE}" \
            --service "${{ secrets.RAILWAY_SERVICE }}" \
            --environment production \
            --project "${{ secrets.RAILWAY_PROJECT }}" \
            --skip-deploys

      - name: Deploy API to Railway
        working-directory: apps/api
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          railway up --ci \
            --service "${{ secrets.RAILWAY_SERVICE }}" \
            --environment production \
            --project "${{ secrets.RAILWAY_PROJECT }}" \
            --message "Deploy ${GITHUB_SHA}"

  # ============================================================
  # 3. DEPLOY WEB TO VERCEL
  # ============================================================
  deploy-web:
    name: Deploy Web to Vercel
    runs-on: ubuntu-latest
    needs: test

    environment:
      name: production

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Vercel CLI
        run: pnpm add --global vercel@59.9.1

      - name: Pull Vercel production environment
        working-directory: apps/web
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          vercel pull \
            --yes \
            --environment=production \
            --token="$VERCEL_TOKEN"

      - name: Build Vercel production artifact
        working-directory: apps/web
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          NEXT_PUBLIC_SENTRY_DSN: ${{ secrets.NEXT_PUBLIC_SENTRY_DSN }}
          SENTRY_ENVIRONMENT: production
          SENTRY_RELEASE: linkforge-web@${{ github.sha }}
        run: |
          vercel build \
            --prod \
            --token="$VERCEL_TOKEN"

      - name: Deploy Vercel production artifact
        working-directory: apps/web
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          vercel deploy \
            --prebuilt \
            --prod \
            --token="$VERCEL_TOKEN"

  # ============================================================
  # 4. PRODUCTION HEALTH CHECK
  # ============================================================
  health-check:
    name: Production Health Check
    runs-on: ubuntu-latest

    needs:
      - deploy-api
      - deploy-web

    environment:
      name: production

    steps:
      - name: Check API health
        env:
          API_HEALTH_URL: ${{ secrets.API_HEALTH_URL }}
        run: |
          echo "Checking API health..."

          MAX_RETRIES=12
          DELAY_SECONDS=5

          for ATTEMPT in $(seq 1 $MAX_RETRIES); do
            echo "Attempt $ATTEMPT/$MAX_RETRIES"

            if curl \
              --fail \
              --silent \
              --show-error \
              --max-time 10 \
              "$API_HEALTH_URL/health"; then

              echo "API is healthy."
              exit 0
            fi

            if [ "$ATTEMPT" -lt "$MAX_RETRIES" ]; then
              echo "API not ready. Retrying in ${DELAY_SECONDS}s..."
              sleep "$DELAY_SECONDS"
            fi
          done

          echo "API health check failed."
          exit 1

      - name: Check Web
        env:
          WEB_URL: ${{ secrets.WEB_URL }}
        run: |
          echo "Checking web..."

          curl \
            --fail \
            --silent \
            --show-error \
            --max-time 10 \
            "$WEB_URL"

          echo "Web is healthy."

  # ============================================================
  # 5. DEPLOYMENT SUMMARY
  # ============================================================
  deployment-success:
    name: Deployment Successful
    runs-on: ubuntu-latest

    needs:
      - health-check

    steps:
      - name: Deployment complete
        run: |
          echo "=========================================="
          echo " LinkForge production deployment succeeded"
          echo " Commit: ${GITHUB_SHA}"
          echo " API Release: linkforge-api@${GITHUB_SHA}"
          echo " Web Release: linkforge-web@${GITHUB_SHA}"
          echo "=========================================="
```

---

# 60. One Important Sentry Configuration Requirement

The workflow above establishes the release/environment values.

The application must still consume them.

Backend:

```ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
  release: process.env.SENTRY_RELEASE,
});
```

Frontend:

```text
NEXT_PUBLIC_SENTRY_DSN
SENTRY_ENVIRONMENT
SENTRY_RELEASE
```

must be wired into the actual `@sentry/nextjs` configuration.

The exact Sentry configuration files depend on how the Next.js project is structured.

The invariant is:

```text
SENTRY_RELEASE
       ↓
Sentry SDK
       ↓
Sentry event
```

If the application never reads the variable, merely defining it in GitHub Actions has no effect.

---

# 61. Production Verification Checklist

Before considering the system complete:

```text
Sentry
[ ] API Sentry project exists
[ ] Web Sentry project exists
[ ] API SDK configured
[ ] Web SDK configured
[ ] production environment configured
[ ] release configured
[ ] source maps configured
[ ] release/artifact association verified

GitHub
[ ] production environment exists
[ ] SENTRY_DSN configured
[ ] NEXT_PUBLIC_SENTRY_DSN configured
[ ] RAILWAY_TOKEN configured
[ ] RAILWAY_PROJECT configured
[ ] RAILWAY_SERVICE configured
[ ] VERCEL_TOKEN configured
[ ] VERCEL_ORG_ID configured
[ ] VERCEL_PROJECT_ID configured
[ ] API_HEALTH_URL configured
[ ] WEB_URL configured

Railway
[ ] correct project selected
[ ] correct production environment selected
[ ] correct API service selected
[ ] SENTRY_DSN present
[ ] SENTRY_ENVIRONMENT present
[ ] SENTRY_RELEASE present
[ ] API /health endpoint works

Vercel
[ ] correct project linked
[ ] correct organization ID
[ ] correct project ID
[ ] production deployment works
[ ] frontend Sentry configuration works

GitHub Actions
[ ] test job passes
[ ] API deployment passes
[ ] web deployment passes
[ ] API health check passes
[ ] web health check passes
[ ] final deployment-success job passes

Observability
[ ] backend test error reaches Sentry
[ ] frontend test error reaches Sentry
[ ] environment shows production
[ ] release shows expected Git SHA
[ ] source maps resolve stack traces
```

---

# 62. Final End-to-End Flow

When a developer pushes:

```text
git push origin main
```

the system performs:

```text
                    Git commit
                        │
                        ▼
                 GitHub Actions
                        │
                        ▼
                 Quality Gate
                        │
                  ┌─────┴─────┐
                  │           │
                  ▼           ▼
              Railway       Vercel
                  │           │
                  │           │
                  ▼           ▼
             API release   Web release
             api@SHA       web@SHA
                  │           │
                  ▼           ▼
             Sentry API    Sentry Web
                  │           │
                  └─────┬─────┘
                        │
                        ▼
                 Health Checks
                        │
                        ▼
                Deployment Success
```

If something fails:

```text
Quality failure
      ↓
No deployment
```

or:

```text
Deployment failure
      ↓
Pipeline failure
```

or:

```text
Runtime unhealthy
      ↓
Health-check failure
```

or:

```text
Production exception
      ↓
Sentry
      ↓
Release
      ↓
Git commit
      ↓
Source code
```

---

# 63. What We Have Actually Built

This is no longer just a deployment script.

It is a basic production delivery system with five major properties.

## 1. Continuous Integration

The code is validated before deployment.

```text
lint
tests
type checks
build
```

---

## 2. Continuous Deployment

A successful `main` branch change automatically reaches:

```text
Railway
Vercel
```

---

## 3. Release Traceability

Every deployment is associated with:

```text
Git SHA
```

through:

```text
linkforge-api@<sha>
linkforge-web@<sha>
```

---

## 4. Observability

Production failures are captured by:

```text
Sentry
```

with:

```text
environment
release
stack trace
source mapping
```

---

## 5. Deployment Verification

The pipeline does not blindly trust the deployment platform.

It checks:

```text
API /health
Web /
```

before declaring success.

---

# 64. The Production Engineering Mental Model

The entire architecture can be reduced to this:

```text
             SOURCE
                │
                ▼
              CI
                │
                ▼
           ARTIFACT
                │
                ▼
           DEPLOYMENT
                │
          ┌─────┴─────┐
          ▼           ▼
       Railway      Vercel
          │           │
          ▼           ▼
       Sentry       Sentry
          │           │
          └─────┬─────┘
                ▼
          VERIFICATION
                │
                ▼
          PRODUCTION
```

And when something goes wrong:

```text
Production
    ↓
Sentry
    ↓
Release
    ↓
Git SHA
    ↓
GitHub
    ↓
Exact change
```

That is the real value of the system.

A production deployment should not merely answer:

> “Did the deployment command succeed?”

It should answer:

> **“Which exact code passed CI, where was it deployed, which release is running, can production errors be mapped to that release and original source, and did the deployed systems actually become healthy?”**

That is the foundation of a production-grade CI/CD and observability setup.
