# Walkthrough: Prometheus Metrics Integration with `prom-client`

We have implemented a production-ready Prometheus metrics observability layer for the Express backend (`apps/api`) using `prom-client` (v15.x).

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
       ┌───────────────────────────────┐
       │   Express API (Port 5000)     │
       │  ├─ requestIdMiddleware       │
       │  ├─ metricsMiddleware         │
       │  ├─ routes / controllers      │
       │  └─ GET /metrics (Prometheus) │
       └───────────────────────────────┘
```

---

## 2. File Changes

### Added Files
- [`apps/api/src/lib/metrics.ts`](file:///d:/linkforge/apps/api/src/lib/metrics.ts):
  - Isolated Prometheus `Registry`.
  - Default Node.js / process runtime metrics via `collectDefaultMetrics`.
  - Custom HTTP request counter (`http_requests_total`).
  - Custom HTTP request duration histogram (`http_request_duration_seconds`) with latency buckets `[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]`.
  - Metrics export and helper utilities (`getMetrics()`, `getMetricsContentType()`, `resetMetrics()`).
- [`apps/api/src/middlewares/metrics.middleware.ts`](file:///d:/linkforge/apps/api/src/middlewares/metrics.middleware.ts):
  - High-precision duration timing using `process.hrtime.bigint()`.
  - Strict route normalization protecting against high-cardinality label explosion (unmatched / 404 paths map to `"unknown"`; dynamic routes preserve patterns like `:id`).
  - Automatic exclusion of `/metrics` scraping requests from application traffic counts.
  - Safe response completion handlers (`finish` / `close` with once guard).
- [`apps/api/tests/metrics.test.ts`](file:///d:/linkforge/apps/api/tests/metrics.test.ts):
  - Comprehensive automated test suite covering all 9 test scenarios.
- [`infra/prometheus/prometheus.yml`](file:///d:/linkforge/infra/prometheus/prometheus.yml):
  - Prometheus configuration targeting `api:5000/metrics` on a 10s scrape interval.

### Modified Files
- [`apps/api/package.json`](file:///d:/linkforge/apps/api/package.json):
  - Added `prom-client: "^15.1.3"` and `"test:metrics": "tsx tests/metrics.test.ts"`.
- [`apps/api/main.ts`](file:///d:/linkforge/apps/api/main.ts):
  - Mounted `metricsMiddleware` early in the Express pipeline.
  - Added `GET /metrics` route returning standard Prometheus metrics content.
- [`docker-compose.prod.yml`](file:///d:/linkforge/docker-compose.prod.yml):
  - Added `prometheus` service (`prom/prometheus:v2.53.0`) and `prometheus_data` volume on `linkflow-internal`.
- [`nginx/conf.d/default.conf`](file:///d:/linkforge/nginx/conf.d/default.conf):
  - Added `/metrics` proxy location block.
- [`docs/observability/README.md`](file:///d:/linkforge/docs/observability/README.md):
  - Added Section 22: Prometheus Metrics & Docker Scraping guide.

---

## 3. Metrics Catalog & Labels

| Metric Name | Type | Labels | Description |
|---|---|---|---|
| `http_requests_total` | Counter | `method`, `route`, `status_code` | Total HTTP requests handled by Express API |
| `http_request_duration_seconds` | Histogram | `method`, `route`, `status_code` | Latency distribution of HTTP requests in seconds |
| `process_cpu_seconds_total` | Counter | - | Total user and system CPU time spent in seconds |
| `nodejs_heap_size_total_bytes` | Gauge | - | Process memory heap size in bytes |
| `nodejs_eventloop_lag_seconds` | Gauge | - | Event loop lag in seconds |
| `process_start_time_seconds` | Gauge | - | Unix timestamp of process start time |

---

## 4. Verification & Testing

### Running the Test Suite
```bash
pnpm --filter api test:metrics
```

### Manual Scrape Verification
```bash
# Direct from API
curl -i http://localhost:5000/metrics

# Via Nginx reverse proxy
curl -i http://localhost/metrics
```
