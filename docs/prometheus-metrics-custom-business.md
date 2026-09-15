# Walkthrough: Prometheus Metrics & Custom Business Metrics Integration

We have implemented a production-ready Prometheus metrics observability layer for the Express backend (`apps/api`) using `prom-client` (v15.x), featuring both runtime/HTTP metrics and four core business metrics:
1. `active_users_total` (Prometheus Gauge)
2. `links_created_total` (Prometheus Counter)
3. `clicks_processed_total` (Prometheus Counter)
4. `queue_depth` (Prometheus Gauge)

---

## 1. Key Changes & Architecture

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                       Inbound Traffic                       │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────▼───────────────┐
               │  Nginx Reverse Proxy Gateway  │
               │        (Ports 80 / 443)       │
               └───┬───────────────────────┬───┘
                   │                       │
      /api/*, /health, /metrics            │ /metrics (Internal Scrape)
                   │                       │
                   │           ┌───────────▼───────────┐
                   │           │  Prometheus Container │
                   │           │      (Port 9090)      │
                   │           └───────────┬───────────┘
                   │                       │
                   │  ┌────────────────────┘
                   ▼  ▼
       ┌──────────────────────────────────────────────────┐
       │   Express API (Port 5000)                        │
       │  ├─ requestIdMiddleware                          │
       │  ├─ metricsMiddleware (HTTP latency & counts)    │
       │  ├─ Business Metrics Service (lib/metrics.ts)    │
       │  ├─ Background Gauges Refresher (30s interval)   │
       │  ├─ Link Service (records links_created_total)   │
       │  ├─ Click Worker (records clicks_processed_total)│
       │  └─ GET /metrics (Prometheus endpoint)           │
       └──────────────────────────────────────────────────┘
```

---

## 2. Business Metrics Implementation Details

### 1. `active_users_total` (Gauge)
- **Business Meaning**: Real-time count of unique active users with unexpired sessions in PostgreSQL (`expiresAt > NOW()`).
- **Update Mechanism**: Refreshed periodically via a managed background refresher (every 30s) or on demand (`refreshActiveUsersMetric()`), preventing PostgreSQL query spikes during Prometheus scrapes.
- **Labels**: None.

### 2. `links_created_total` (Counter)
- **Business Meaning**: Total count of links successfully created and persisted.
- **Update Mechanism**: Incremented via `recordLinkCreated()` in `apps/api/src/services/link.service.ts` immediately after `prisma.link.create()` succeeds.
- **Protection**: Never incremented on validation errors (400), authentication failures (401), plan limit denials (403), or database exceptions.

### 3. `clicks_processed_total` (Counter)
- **Business Meaning**: Total count of click events successfully processed and persisted by the BullMQ worker.
- **Update Mechanism**: Incremented via `recordClickProcessed()` in `apps/api/src/workers/click.worker.ts` immediately after `prisma.clickEvent.create()` succeeds.
- **Protection**: Never incremented when a job is merely enqueued or when worker processing fails. BullMQ retries do not cause double counting.

### 4. `queue_depth` (Gauge)
- **Business Meaning**: Current pending workload in the `click-tracking` BullMQ queue (`waiting + delayed + prioritized` jobs).
- **Update Mechanism**: Polled from BullMQ via `clickQueue.getJobCounts("waiting", "delayed", "prioritized")` during background refresher cycles (`refreshQueueDepthMetric()`).
- **Protection**: Excludes completed and failed job histories.

---

## 3. Metrics Catalog

| Metric Name | Type | Labels | Description |
|---|---|---|---|
| `active_users_total` | Gauge | none | Current number of unique users with active unexpired sessions |
| `links_created_total` | Counter | none | Total number of links successfully created and persisted |
| `clicks_processed_total` | Counter | none | Total number of click events successfully processed by the worker |
| `queue_depth` | Gauge | none | Current pending workload (waiting + delayed + prioritized) in click queue |
| `http_requests_total` | Counter | `method`, `route`, `status_code` | Total HTTP requests handled by Express API |
| `http_request_duration_seconds` | Histogram | `method`, `route`, `status_code` | Latency distribution of HTTP requests in seconds |
| `process_cpu_seconds_total` | Counter | none | Total user and system CPU time spent in seconds |
| `nodejs_heap_size_total_bytes` | Gauge | none | Process memory heap size in bytes |
| `nodejs_eventloop_lag_seconds` | Gauge | none | Event loop lag in seconds |

---

## 4. Useful PromQL Queries

```promql
# 1. Link creation rate over 5 minutes
rate(links_created_total[5m])

# 2. Links created in the last 1 hour
increase(links_created_total[1h])

# 3. Click processing throughput
rate(clicks_processed_total[5m])

# 4. Current active users
active_users_total

# 5. Queue depth backlog
queue_depth
```

---

## 5. Verification & Testing

### Running the Test Suite
```bash
pnpm --filter api test:metrics
```
Tests verify all 14 scenarios including:
- HTTP 200 and Prometheus content type for `GET /metrics`
- Default Node.js/process metrics presence
- HTTP request counter and latency histogram
- 404 cardinality bounded to `route="unknown"`
- Parameterized route normalization (`:id`)
- `links_created_total` counter behavior and failure safety
- `clicks_processed_total` counter behavior in worker
- `active_users_total` gauge and database session querying
- `queue_depth` gauge and BullMQ pending job calculation
- Clean timer shutdown and registry isolation between tests
