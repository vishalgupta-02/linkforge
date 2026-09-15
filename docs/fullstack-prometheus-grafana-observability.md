# Walkthrough: Full-Stack Prometheus & Grafana Observability

We have extended the observability architecture across the Linkforge monorepo to include **Grafana (v11.1.0)**, connecting it to the existing **Prometheus (v2.53.0)** instance with automated datasource and dashboard provisioning.

---

## 1. End-to-End Observability Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Inbound Traffic                               │
└────────────────────────────────────┬────────────────────────────────────┘
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
                         │                       │ PromQL (http://prometheus:9090)
                         │                       ▼
                         │           ┌───────────────────────┐
                         │           │   Grafana Container   │
                         │           │      (Port 3001)      │
                         │           │ ┌───────────────────┐ │
                         │           │ │Application Overview││
                         │           │ └───────────────────┘ │
                         │           └───────────────────────┘
                         ▼
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

## 2. Grafana Implementation Details

### A. Docker Compose Service
- **Service Name**: `grafana` (`linkflow_grafana_prod`)
- **Image**: `grafana/grafana:11.1.0`
- **Host Port**: `3001:3000` (avoids port collisions with Next.js web frontend)
- **Networks**: `linkflow-internal` (internal bridge connection to `prometheus:9090`)
- **Named Volume**: `grafana_data:/var/lib/grafana` for persistent storage

### B. Automated Provisioning
1. **Datasource**: [`infra/grafana/provisioning/datasources/prometheus.yml`](file:///d:/linkforge/infra/grafana/provisioning/datasources/prometheus.yml)
   - Automatically connects to `http://prometheus:9090` using the internal Docker service name.
2. **Dashboard Provider**: [`infra/grafana/provisioning/dashboards/dashboards.yml`](file:///d:/linkforge/infra/grafana/provisioning/dashboards/dashboards.yml)
   - Automatically imports all JSON dashboards in `/var/lib/grafana/dashboards`.
3. **Production Dashboard**: [`infra/grafana/dashboards/application-overview.json`](file:///d:/linkforge/infra/grafana/dashboards/application-overview.json)
   - Dashboard: **Linkforge - Application Overview** (`linkforge-app-overview`)

---

## 3. Dashboard Panels & PromQL

| Panel Name | Panel Type | PromQL Query | Unit |
|---|---|---|---|
| **Request Rate** | Stat & TimeSeries | `sum(rate(http_requests_total[5m]))` | `reqps` |
| **Error Rate (5xx)** | Stat & TimeSeries | `clamp_min(100 * (sum(rate(http_requests_total{status_code=~"5.."}[5m])) or 0) / (sum(rate(http_requests_total[5m])) > 0), 0) or vector(0)` | `%` |
| **Latency P50** | Stat & TimeSeries | `histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))` | `s` |
| **Latency P95** | Stat & TimeSeries | `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))` | `s` |
| **Latency P99** | Stat & TimeSeries | `histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))` | `s` |
| **Active Users** | Stat | `active_users_total or vector(0)` | `none` |
| **Links Created Rate** | TimeSeries | `sum(rate(links_created_total[5m]))` | `short` |
| **Clicks Processed Rate** | TimeSeries | `sum(rate(clicks_processed_total[5m]))` | `short` |
| **Queue Depth** | Stat | `queue_depth or vector(0)` | `short` |

---

## 4. How to Run Locally

1. **Start the stack**:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```
2. **Access Grafana**:
   - URL: [http://localhost:3001](http://localhost:3001)
   - Credentials: `admin` / `admin`
   - Dashboard: **Linkforge - Application Overview** is pre-loaded under the **Linkforge** folder.
3. **Run Automated Test Suite**:
   ```bash
   pnpm --filter api test:metrics
   ```
