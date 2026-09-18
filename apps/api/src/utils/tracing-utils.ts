import { trace, context, SpanStatusCode, type Span } from "@opentelemetry/api";

const tracer = trace.getTracer("linkforge-api");

export interface TraceContextInfo {
  traceId?: string;
  spanId?: string;
  traceFlags?: number;
}

export function getTraceContext(): TraceContextInfo {
  const activeSpan = trace.getActiveSpan();
  if (!activeSpan) return {};

  const spanContext = activeSpan.spanContext();
  if (!spanContext.traceId) return {};

  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
    traceFlags: spanContext.traceFlags,
  };
}

export async function createTraceSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T> | T,
  attributes?: Record<string, string | number | boolean>,
): Promise<T> {
  return tracer.startActiveSpan(name, async (span) => {
    if (attributes) {
      span.setAttributes(attributes);
    }
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  });
}
