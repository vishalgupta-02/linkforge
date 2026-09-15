# Prometheus Alerting Rules & Alertmanager Email Notification Routing

This guide details the production alerting architecture, Prometheus alerting rule definitions, Alertmanager configuration, SMTP environment variables, operational runbooks, and troubleshooting procedures for LinkFlow.

---

## 1. Observability & Alerting Architecture

```
                        ┌──────────────────┐
                        │   Express API    │
                        │                  │
                        │   prom-client    │
                        └────────┬─────────┘
                                 │
                                 │ GET /metrics (every 10s)
                                 ▼
                        ┌──────────────────┐
                        │    Prometheus    │
                        │                  │
                        │ scrape + rules   │
                        └────────┬─────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
             ┌─────────────┐          ┌──────────────┐
             │   Grafana   │          │ Alertmanager │
             │ dashboards  │          │              │
             └─────────────┘          └──────┬───────┘
                                             │
                                             │ SMTP (TLS / Port 587)
                                             ▼
                                      ┌──────────────┐
                                      │    Email     │
                                      │  Recipient   │
                                      └──────────────┘
```

### Separation of Responsibilities
1. **Express API (`apps/api`)**: Collects and exposes standard and custom Prometheus metrics (`http_requests_total`, `http_request_duration_seconds`, `queue_depth`, etc.) at `/metrics`.
2. **Prometheus (`prom/prometheus:v2.53.0`)**: Evaluates alerting rules against scraped time-series data at 15s evaluation intervals. When conditions cross thresholds for the required duration, Prometheus generates alert instances and forwards them to Alertmanager.
3. **Alertmanager (`prom/alertmanager:v0.27.0`)**: Manages notification lifecycle, deduplicates/groups alerts, formats email templates, and routes notifications via SMTP.
4. **Grafana (`grafana/grafana:11.1.0`)**: Visualizes live metrics and historical trends without managing alert dispatching.

---

## 2. Production Alerting Rules

All alerting rules are defined in [`infra/prometheus/rules/alerts.yml`](file:///d:/linkforge/infra/prometheus/rules/alerts.yml):

### Alert 1: `HighHTTPErrorRate`
* **Condition**: HTTP 5xx server error rate exceeds 5% of total HTTP requests.
* **Duration (`for`)**: `5m` (must remain continuously elevated for 5 minutes).
* **Severity**: `critical`.
* **PromQL Expression**:
  ```promql
  (
    sum(rate(http_requests_total{status_code=~"5.."}[5m]))
    /
    sum(rate(http_requests_total[5m]))
  ) > 0.05 and sum(rate(http_requests_total[5m])) > 0
  ```
* **Operational Meaning**: Indicates a widespread server failure, broken database connection, unhandled rejection, or failing downstream dependency. The guard `sum(rate(http_requests_total[5m])) > 0` prevents false positive alerts during zero-traffic windows.

### Alert 2: `HighHTTPP99Latency`
* **Condition**: Overall application 99th percentile (P99) request duration exceeds 2.0 seconds.
* **Duration (`for`)**: `2m` (stabilization window).
* **Severity**: `critical`.
* **PromQL Expression**:
  ```promql
  histogram_quantile(
    0.99,
    sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
  ) > 2
  ```
* **Operational Meaning**: Indicates severe backend congestion, slow unindexed database queries, CPU starvation, or network latency spikes degrading user experience.

### Alert 3: `HighQueueDepth`
* **Condition**: Total pending BullMQ click tracking queue workload (waiting + delayed + prioritized jobs) exceeds 1000 jobs.
* **Duration (`for`)**: `2m` (stabilization window to ignore transient bursts).
* **Severity**: `warning`.
* **PromQL Expression**:
  ```promql
  queue_depth > 1000
  ```
* **Operational Meaning**: Indicates the Redis BullMQ worker is lagging behind ingestion rates, redis worker process is stalled, or a high-volume click tracking spike requires worker scaling.

---

## 3. Alertmanager & SMTP Email Configuration

Alertmanager is configured in [`infra/alertmanager/alertmanager.yml`](file:///d:/linkforge/infra/alertmanager/alertmanager.yml).

### Grouping & Deduplication
* `group_by: ["alertname", "severity", "app"]`: Bounded grouping prevents alert storms while preserving alert clarity.
* `group_wait: 30s`: Buffers alerts to bundle related events into a single email.
* `group_interval: 5m`: Minimum time before sending new notifications about an existing active group.
* `repeat_interval: 4h`: Prevents repetitive email notifications for an acknowledged/persisting incident.
* `send_resolved: true`: Automatically sends a green resolution email when an alert condition clears.

### Environment Variables
To enable live email delivery, configure the following variables in `.env` (templates provided in [`.env.example`](file:///d:/linkforge/.env.example)):

| Variable | Description | Example / Default |
|---|---|---|
| `SMTP_HOST` | SMTP server hostname | `smtp.resend.com` |
| `SMTP_PORT` | SMTP port with STARTTLS | `587` |
| `SMTP_USERNAME` | SMTP authentication username | `resend` |
| `SMTP_PASSWORD` | SMTP authentication password / API key | `re_your_smtp_key_here` |
| `ALERT_FROM_EMAIL` | Verified sender email address | `alerts@linkflow.dev` |
| `ALERT_TO_EMAIL` | On-call / Engineering recipient email | `admin@linkflow.dev` |

> [!IMPORTANT]
> **Human-in-the-Loop Boundary**: Never commit real SMTP credentials to Git. If no credentials are provided, Alertmanager will start cleanly and manage internal alert states, but physical email transmission requires valid operator-supplied SMTP settings.

---

## 4. Docker Compose Integration

Alertmanager runs as part of the production Docker Compose stack in [`docker-compose.prod.yml`](file:///d:/linkforge/docker-compose.prod.yml):

```yaml
alertmanager:
  image: prom/alertmanager:v0.27.0
  container_name: linkflow_alertmanager_prod
  restart: unless-stopped
  environment:
    SMTP_HOST: ${SMTP_HOST:-smtp.resend.com}
    SMTP_PORT: ${SMTP_PORT:-587}
    SMTP_USERNAME: ${SMTP_USERNAME:-resend}
    SMTP_PASSWORD: ${SMTP_PASSWORD:-}
    ALERT_FROM_EMAIL: ${ALERT_FROM_EMAIL:-alerts@linkflow.dev}
    ALERT_TO_EMAIL: ${ALERT_TO_EMAIL:-admin@linkflow.dev}
  volumes:
    - ./infra/alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
    - alertmanager_data:/alertmanager
  command:
    - "--config.file=/etc/alertmanager/alertmanager.yml"
    - "--storage.path=/alertmanager"
  ports:
    - "9093:9093"
  healthcheck:
    test: ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost:9093/-/healthy || exit 1"]
    interval: 10s
    timeout: 5s
    start_period: 5s
    retries: 3
  networks:
    - linkflow-internal
```

Prometheus configuration mounts the rules directory and routes alerts directly over the internal Docker network (`alertmanager:9093`):

```yaml
# infra/prometheus/prometheus.yml
rule_files:
  - "/etc/prometheus/rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets: ["alertmanager:9093"]
```

---

## 5. Operational Runbooks

### `HighHTTPErrorRate`
1. Check Sentry dashboard for recent unhandled exceptions and spikes in 5xx status codes.
2. Inspect Express API logs: `docker logs linkflow_api_prod --tail 200`.
3. Verify PostgreSQL database connectivity and pool exhaustion: `docker logs linkflow_postgres_prod`.
4. Verify Redis health: `docker exec -it linkflow_redis_prod redis-cli ping`.
5. Roll back recent deployments if errors correlate with a specific release.

### `HighHTTPP99Latency`
1. Inspect Grafana latency panel (`http_request_duration_seconds`) to identify the impacted route pattern.
2. Check database query performance and locks in PostgreSQL.
3. Check Node.js Event Loop Lag gauge (`nodejs_eventloop_lag_seconds`) in Grafana.
4. Check CPU and memory usage (`process_cpu_seconds_total`, `nodejs_heap_size_total_bytes`).

### `HighQueueDepth`
1. Check BullMQ click worker logs: `docker logs linkflow_worker_prod --tail 200`.
2. Verify Redis throughput and memory capacity.
3. Check database write latency for click aggregation tables.
4. If ingestion traffic has legitimately increased, scale worker instances or increase BullMQ concurrency.

---

## 6. Troubleshooting

### Alert does not fire in Prometheus
1. Verify `/metrics` returns expected metric names (`http_requests_total`, `http_request_duration_seconds_bucket`, `queue_depth`).
2. Open Prometheus UI at `http://localhost:9090/alerts` to inspect rule evaluation states (Inactive, Pending, Firing).
3. Test PromQL queries in Prometheus Expression Browser (`http://localhost:9090/graph`).
4. Check Prometheus container logs: `docker logs linkflow_prometheus_prod`.

### Alert fires in Prometheus but no email is received
1. Check Alertmanager UI at `http://localhost:9093/#/alerts` to verify Alertmanager received the alert from Prometheus.
2. Check Alertmanager logs for SMTP delivery errors: `docker logs linkflow_alertmanager_prod`.
3. Verify `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, and `SMTP_PASSWORD` in `.env`.
4. Ensure `ALERT_FROM_EMAIL` is a verified sender domain with SPF/DKIM configured.
5. Check recipient spam/junk folders.
