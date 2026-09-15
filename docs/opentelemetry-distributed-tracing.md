# Walkthrough - OpenTelemetry Distributed Tracing & Grafana Tempo

This document summarizes the end-to-end implementation of production-grade **OpenTelemetry distributed tracing** integrated with **Grafana Tempo** across the Linkforge backend and observability architecture.

---

## 1. Architecture Summary

The OpenTelemetry distributed tracing pipeline automatically captures every incoming HTTP request, Express route middleware, Prisma database query, and Redis cache lookup, streaming them to Grafana Tempo for full trace visualization.

```text
HTTP request received (Next.js or client)
        ↓ (traceparent / sentry-trace header)
Express route / controller
        ↓
Business / service logic (custom spans)
        ↓
PostgreSQL / Prisma query (@prisma/instrumentation & pg)
        ↓
Redis cache operation (@opentelemetry/instrumentation-ioredis)
        ↓
Response delivered
        ↓
Streamed via OTLP/HTTP → Grafana Tempo (port 4318) → Visualized in Grafana (port 3001)
```

---

## 2. Key Components Created & Modified

### A. OpenTelemetry Core SDK & Utilities
- [`apps/api/src/lib/tracing.ts`](file:///d:/linkforge/apps/api/src/lib/tracing.ts):
  - Initializes OpenTelemetry `NodeSDK` with `Resource` attributes (`service.name`, `service.version`, `deployment.environment`).
  - Configurable trace sampler supporting `parentbased_traceidratio`, `always_on`, and `always_off`.
  - Integrates auto-instrumentations: `HttpInstrumentation` (filters `/metrics` and `/health`), `ExpressInstrumentation`, `IORedisInstrumentation`, `PgInstrumentation`, and `PrismaInstrumentation`.
  - Configures `OTLPTraceExporter` to send traces to `OTEL_EXPORTER_OTLP_ENDPOINT`.
  - Provides safe non-blocking `initTracing()` and graceful `shutdownTracing()`.
- [`apps/api/src/utils/tracing-utils.ts`](file:///d:/linkforge/apps/api/src/utils/tracing-utils.ts):
  - `getTraceContext()`: Safely extracts active `traceId` and `spanId`.
  - `createTraceSpan()`: Wraps asynchronous business logic in custom spans, setting status codes and recording exceptions on failure.

### B. Startup & Structured Logging Integration
- [`apps/api/instrument.ts`](file:///d:/linkforge/apps/api/instrument.ts): Calls `initTracing()` as step 1 before loading Sentry, Express, Prisma, or Redis.
- [`apps/api/src/lib/logger.ts`](file:///d:/linkforge/apps/api/src/lib/logger.ts): Automatically enriches every structured log with `trace_id` and `span_id` whenever an active trace context exists.

### C. Infrastructure & Grafana Tempo Provisioning
- [`infra/tempo/tempo.yml`](file:///d:/linkforge/infra/tempo/tempo.yml): Tempo server configuration accepting OTLP HTTP (`4318`) and gRPC (`4317`) with local retention and WAL storage.
- [`infra/grafana/provisioning/datasources/tempo.yml`](file:///d:/linkforge/infra/grafana/provisioning/datasources/tempo.yml): Provisions Grafana Tempo datasource with Node Graph and trace-to-metrics queries linked to Prometheus.
- [`docker-compose.prod.yml`](file:///d:/linkforge/docker-compose.prod.yml):
  - Added `tempo` service (`grafana/tempo:2.5.0`).
  - Added `tempo_data` persistent volume.
  - Configured `OTEL_*` environment variables in `api` container.

### D. Automated Testing & Verification
- [`apps/api/tests/tracing.test.ts`](file:///d:/linkforge/apps/api/tests/tracing.test.ts):
  - SDK initialization and idempotency.
  - `getTraceContext()` inside and outside active spans.
  - Custom span creation and error handling.
  - Parent-child nested span trace ID consistency.
  - Structured log trace ID / span ID correlation.
  - Graceful SDK shutdown.

---

## 3. Configuration Reference

```env
# OpenTelemetry Distributed Tracing & Tempo
OTEL_SERVICE_NAME=linkforge-api
OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4318/v1/traces
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1
```
