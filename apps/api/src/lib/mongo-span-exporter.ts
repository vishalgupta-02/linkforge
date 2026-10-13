import type { SpanExporter, ReadableSpan } from "@opentelemetry/sdk-trace-base";
import { recordMongoLog } from "./mongo-logger.ts";
import { scrubSensitiveData } from "./logger.ts";

export class MongoSpanExporter implements SpanExporter {
  export(
    spans: ReadableSpan[],
    resultCallback: (result: { code: number; error?: Error }) => void,
  ): void {
    // Store spans in MongoDB for production only, not for development
    if (process.env.NODE_ENV !== "production" && process.env.FORCE_MONGO_LOGS !== "true") {
      return resultCallback({ code: 0 });
    }

    for (const span of spans) {
      try {
        const traceId = span.spanContext().traceId;
        const spanId = span.spanContext().spanId;
        const parentSpanId = (span as unknown as { parentSpanId?: string }).parentSpanId || null;
        const durationSec = span.duration[0] || 0;
        const durationNano = span.duration[1] || 0;
        const durationMs = Number((durationSec * 1000 + durationNano / 1e6).toFixed(2));
        const isError = span.status?.code === 2; // SpanStatusCode.ERROR === 2

        const rawAttrs = span.attributes || {};
        const sanitizedAttributes = scrubSensitiveData(rawAttrs) as Record<string, unknown>;

        let exceptionError: Record<string, unknown> | null = null;
        if (span.events && span.events.length > 0) {
          for (const ev of span.events) {
            if (ev.name === "exception" && ev.attributes) {
              exceptionError = {
                name: String(ev.attributes["exception.type"] || "SpanException"),
                message: String(ev.attributes["exception.message"] || span.status?.message || "Unknown error"),
                stack: String(ev.attributes["exception.stacktrace"] || ""),
              };
              // Also log separate otel_event
              recordMongoLog({
                level: "error",
                category: "otel_event",
                message: `[OTel Exception] in ${span.name}: ${exceptionError.message}`,
                traceId,
                spanId,
                parentSpanId,
                durationMs,
                metadata: {
                  eventName: ev.name,
                  eventTime: ev.time,
                  attributes: scrubSensitiveData(ev.attributes),
                },
                error: exceptionError as any,
              });
            }
          }
        }

        recordMongoLog({
          level: isError ? "error" : "info",
          category: "otel_span",
          message: `[OTel Span] ${span.name} (${durationMs}ms)`,
          traceId,
          spanId,
          parentSpanId,
          durationMs,
          statusCode: typeof sanitizedAttributes["http.status_code"] === "number" ? sanitizedAttributes["http.status_code"] : null,
          method: typeof sanitizedAttributes["http.method"] === "string" ? sanitizedAttributes["http.method"] : null,
          route: typeof sanitizedAttributes["http.route"] === "string" ? sanitizedAttributes["http.route"] : null,
          metadata: {
            name: span.name,
            kind: span.kind,
            status: span.status,
            attributes: sanitizedAttributes,
            eventsCount: span.events?.length || 0,
          },
          error: isError
            ? exceptionError || {
                name: "SpanError",
                message: span.status?.message || "Span status indicated an error",
              }
            : null,
        });
      } catch {
        // Non-blocking fallback
      }
    }

    resultCallback({ code: 0 });
  }

  async shutdown(): Promise<void> {
    return Promise.resolve();
  }

  forceFlush?(): Promise<void> {
    return Promise.resolve();
  }
}
