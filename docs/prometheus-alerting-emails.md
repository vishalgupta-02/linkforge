# Walkthrough: Prometheus Alerting Rules & Alertmanager Email Notification Routing

We have implemented production-oriented **Prometheus alerting rules** and **Alertmanager email notification routing** extending LinkFlow's existing observability architecture.

---

## 1. Observability Architecture

```text
                        ┌──────────────────┐
                        │   Express API    │
                        │                  │
                        │   prom-client    │
                        └────────┬─────────┘
                                 │
                                 │ /metrics
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
                                             │ SMTP
                                             ▼
                                      ┌──────────────┐
                                      │    Email     │
                                      └──────────────┘
```

---

## 2. Production Alerting Rules

Configured in [`infra/prometheus/rules/alerts.yml`](file:///d:/linkforge/infra/prometheus/rules/alerts.yml):

| Alert | Expression | Threshold | Duration (`for`) | Severity | Meaning |
|---|---|---|---|---|---|
| **`HighHTTPErrorRate`** | `(sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) > 0.05 and sum(rate(http_requests_total[5m])) > 0` | > 5% (0.05) | `5m` | `critical` | Fires when HTTP 5xx server errors exceed 5% of total requests for 5 minutes continuously. Safe against 0-traffic division. |
| **`HighHTTPP99Latency`** | `histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 2` | > 2.0s | `2m` | `critical` | Fires when P99 HTTP latency across all API routes exceeds 2.0 seconds. |
| **`HighQueueDepth`** | `queue_depth > 1000` | > 1000 jobs | `2m` | `warning` | Fires when pending BullMQ click tracking queue depth exceeds 1000 jobs. |

---

## 3. Alertmanager & Email Routing

Configured in [`infra/alertmanager/alertmanager.yml`](file:///d:/linkforge/infra/alertmanager/alertmanager.yml):
- **Receiver**: `email-notifications` routing all critical and warning alerts to `${ALERT_TO_EMAIL}`.
- **Grouping & Deduplication**: Groups alerts by `["alertname", "severity", "app"]`, with `group_wait: 30s`, `group_interval: 5m`, and `repeat_interval: 4h`.
- **Resolution Notifications**: `send_resolved: true` dispatches green recovery emails when incidents clear.
- **HTML & Text Templates**: Rich responsive email template featuring severity badges, alert descriptions, threshold details, and direct runbook action links.

---

## 4. Docker Compose & Environment Infrastructure

Updated in [`docker-compose.prod.yml`](file:///d:/linkforge/docker-compose.prod.yml):
- **`alertmanager` Service**: Uses `prom/alertmanager:v0.27.0` on internal network `linkflow-internal`, exposes port `9093`, and persists state to named volume `alertmanager_data`.
- **`prometheus` Service**: Updated volume mounts to include `./infra/prometheus/rules:/etc/prometheus/rules:ro`, and declared dependency on `alertmanager`.
- **[`.env.example`](file:///d:/linkforge/.env.example)**: Added environment variable placeholders for `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `ALERT_FROM_EMAIL`, and `ALERT_TO_EMAIL`.

---

## 5. Automated Validation & Test Suite

Implemented comprehensive test suite in [`apps/api/tests/alerts.test.ts`](file:///d:/linkforge/apps/api/tests/alerts.test.ts) (runnable with `npm run test:alerts` or `pnpm --filter api test:alerts`):
- **Prometheus Rule Verification**: Checks group definitions, PromQL expressions, label bounds, severity, and `for` duration.
- **Prometheus Config Verification**: Validates `rule_files` and `alerting.alertmanagers` targets.
- **Alertmanager Config Verification**: Validates SMTP smarthost, routing tree, grouping keys, and email templates.
- **Docker Compose Verification**: Validates service definitions, image tags, ports, volumes, and networks.
- **Mathematical & PromQL Simulation**:
  - Error rate edge cases: 0 traffic (no fire), 0% error (no fire), 3% error (no fire), 6% error (fires).
  - P99 latency simulation: normal P99 < 2s (no fire), degraded P99 > 2s (fires).
  - Queue depth simulation: 42 jobs (no fire), 999 jobs (no fire), 1001 jobs (fires).

---

## 6. Documentation & Runbooks

- Created [`docs/observability/prometheus-alertmanager-email-alerts.md`](file:///d:/linkforge/docs/observability/prometheus-alertmanager-email-alerts.md) containing architecture diagrams, metric definitions, operational runbooks, and step-by-step troubleshooting guides.
- Updated [`docs/observability/README.md`](file:///d:/linkforge/docs/observability/README.md) with Section 24 summarizing the alert catalog and Alertmanager routing.
