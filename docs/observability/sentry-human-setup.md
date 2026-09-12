# Sentry Human Setup & Operations Manual

This guide contains step-by-step instructions for configuring external Sentry dashboard widgets, alert rules, notification integrations, and CI/CD secrets.

---

## 1. Confirm Projects & Copy DSNs

### A. Web Project (Next.js)
1. In Sentry, go to **Settings** → **Projects** → Create or select `linkforge-web`.
2. Under **Client Keys (DSN)**, copy the DSN URL.
3. Add to `apps/web/.env` and Vercel Environment Variables:
   - `NEXT_PUBLIC_SENTRY_DSN`: `https://<public_key>@...ingest.sentry.io/<project_id>`
   - `NEXT_PUBLIC_SENTRY_ENVIRONMENT`: `production` (or `development`)

### B. API Project (Express / Node.js)
1. In Sentry, go to **Settings** → **Projects** → Create or select `linkforge-api`.
2. Under **Client Keys (DSN)**, copy the DSN URL.
3. Add to `apps/api/.env` and Railway Environment Variables:
   - `SENTRY_DSN`: `https://<public_key>@...ingest.sentry.io/<project_id>`
   - `SENTRY_ENVIRONMENT`: `production` (or `development`)

---

## 2. Authentication Tokens & GitHub Secrets

### A. Generate Sentry Auth Token
1. Go to **Settings** → **Developer Settings** → **Custom Integrations** (or **Auth Tokens**).
2. Click **Create New User Auth Token**.
3. Scopes required:
   - `project:read`, `project:releases`, `project:write`
   - `org:read`
4. Name the token: `linkforge-ci-sourcemaps`.
5. Copy the generated token.

### B. Add Secrets to GitHub Repository
Go to your repository on GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:
1. `SENTRY_AUTH_TOKEN`: The auth token generated above.
2. `SENTRY_ORG`: Your Sentry organization slug (e.g., `codemonkey-yo`).
3. `SENTRY_WEB_PROJECT`: `linkforge-web`
4. `SENTRY_API_PROJECT`: `linkforge-api`

---

## 3. Configure Slack / Discord / Email Notifications

1. In Sentry, navigate to **Settings** → **Integrations**.
2. Select **Slack** (or **Discord** / **Microsoft Teams**).
3. Click **Add Installation** and authenticate with your workspace.
4. Select the default alerting channel (e.g. `#alerts-production` or `#engineering-alerts`).

---

## 4. Production Dashboard Setup

Go to **Dashboards** → **Create Dashboard** → Name: `Linkforge Production Overview`.

Add the following widgets:

### Widget 1: Unresolved Error Count & Trend
- **Type**: Line Chart
- **Dataset**: Issues / Errors
- **Query**: `is:unresolved is:for_review`
- **Environment**: `production`
- **Group By**: `error.type`

### Widget 2: Affected Users
- **Type**: Big Number
- **Dataset**: Issues
- **Query**: `is:unresolved`
- **Aggregation**: `count_unique(user.id)`
- **Environment**: `production`

### Widget 3: API Request Throughput (RPM) & Failure Rate
- **Type**: Line Chart
- **Dataset**: Transactions
- **Query**: `transaction.op:http.server`
- **Y-Axis**: `tps()`, `failure_rate()`
- **Environment**: `production`

### Widget 4: API Latency Percentiles (p50, p95, p99)
- **Type**: Line Chart
- **Dataset**: Transactions
- **Query**: `transaction.op:http.server`
- **Y-Axis**: `p50(transaction.duration)`, `p95(transaction.duration)`, `p99(transaction.duration)`
- **Environment**: `production`

### Widget 5: Slowest Endpoints
- **Type**: Table
- **Dataset**: Transactions
- **Query**: `transaction.op:http.server`
- **Columns**: `transaction`, `count()`, `p95(transaction.duration)`, `failure_rate()`
- **Sort By**: `p95(transaction.duration) desc`

### Widget 6: BullMQ Worker Job Duration & Failure Rate
- **Type**: Table
- **Dataset**: Spans
- **Query**: `op:queue.process`
- **Columns**: `queue.name`, `job.name`, `count()`, `p95(span.duration)`, `failure_rate()`

### Widget 7: Core Web Vitals (Frontend)
- **Type**: Bar Chart
- **Dataset**: Performance
- **Y-Axis**: `p75(measurements.lcp)`, `p75(measurements.inp)`, `p75(measurements.cls)`
- **Environment**: `production`

---

## 5. Alert Rules Configuration

Navigate to **Alerts** → **Create Alert**. Configure the 6 required production alerts:

### Alert 1: New Production Issue
- **Type**: Issue Alert
- **When**: A new issue is created
- **If**: `environment = production`
- **Then**: Send notification via Slack (`#alerts-production`) and Email.

### Alert 2: Production Error Spike (Anomaly Detection)
- **Type**: Metric Alert
- **Metric**: `count()` of errors
- **Environment**: `production`
- **Threshold**: Use **Dynamic / Anomaly Detection** (triggers when error count exceeds normal baseline by >2 standard deviations over 5 minutes).
- **Action**: High-priority alert to `#alerts-production`.

### Alert 3: Production Failure Rate Spike
- **Type**: Metric Alert
- **Metric**: `failure_rate()`
- **Environment**: `production`
- **Threshold**: Critical when failure rate > 5% for 5 minutes.
- **Action**: Critical alert to `#alerts-production`.

### Alert 4: API p95 Latency Degradation
- **Type**: Metric Alert
- **Metric**: `p95(transaction.duration)`
- **Query**: `transaction.op:http.server`
- **Environment**: `production`
- **Threshold**: Critical when p95 duration > 1,500ms for 10 minutes (calibrate to production baseline).
- **Action**: Alert to `#alerts-production`.

### Alert 5: API p99 Latency Degradation
- **Type**: Metric Alert
- **Metric**: `p99(transaction.duration)`
- **Query**: `transaction.op:http.server`
- **Environment**: `production`
- **Threshold**: Warning when p99 duration > 3,000ms for 10 minutes.
- **Action**: Alert to `#alerts-production`.

### Alert 6: Critical Infrastructure Failure
- **Type**: Issue Alert
- **Query**: `environment:production (error.type:PrismaClientKnownRequestError OR error.type:PrismaClientInitializationError OR message:"*Redis connection error*" OR message:"*UnrecoverableError*")`
- **Action**: Urgent notification to on-call / `#alerts-production`.

---

## 6. Verifying Alert Configuration

1. In Sentry, go to **Alerts** → Click on the created alert rule → Click **Test Rule**.
2. Confirm that a test notification arrives in your configured Slack channel and email inbox.
