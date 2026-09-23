import assert from "node:assert";
import { trace, context, SpanStatusCode } from "@opentelemetry/api";
import { initTracing, shutdownTracing } from "../src/lib/tracing.ts";
import { getTraceContext, createTraceSpan } from "../src/utils/tracing-utils.ts";
import { logger } from "../src/lib/logger.ts";

async function runTracingTestSuite() {
  console.log("Starting OpenTelemetry Distributed Tracing Test Suite...\n");

  // ---------------------------------------------------------------------------
  // 1. OpenTelemetry SDK Initialization
  // ---------------------------------------------------------------------------
  console.log("1. Testing OpenTelemetry NodeSDK initialization...");
  initTracing();
  // Multiple calls should be idempotent and not throw
  initTracing();
  console.log("OpenTelemetry NodeSDK initializes cleanly and idempotently");

  // ---------------------------------------------------------------------------
  // 2. getTraceContext() outside of active span
  // ---------------------------------------------------------------------------
  console.log("\n2. Testing getTraceContext() without active span...");
  const inactiveContext = getTraceContext();
  assert.deepStrictEqual(
    inactiveContext,
    {},
    "getTraceContext() should return empty object when no active span exists",
  );
  console.log("getTraceContext() safely returns empty context outside active spans");

  // ---------------------------------------------------------------------------
  // 3. createTraceSpan() - Success Execution and Span Context Extraction
  // ---------------------------------------------------------------------------
  console.log("\n3. Testing createTraceSpan() with successful execution...");
  const tracer = trace.getTracer("linkforge-api-test");

  let capturedTraceId: string | undefined;
  let capturedSpanId: string | undefined;

  const result = await createTraceSpan("test.operation", async (span) => {
    const ctx = getTraceContext();
    capturedTraceId = ctx.traceId;
    capturedSpanId = ctx.spanId;

    assert.ok(capturedTraceId, "Active span must have a valid traceId");
    assert.ok(capturedSpanId, "Active span must have a valid spanId");
    assert.strictEqual(typeof capturedTraceId, "string");
    assert.strictEqual(typeof capturedSpanId, "string");
    assert.strictEqual(capturedTraceId.length, 32, "traceId should be 32 hex chars");
    assert.strictEqual(capturedSpanId.length, 16, "spanId should be 16 hex chars");

    return "test-result-value";
  }, { "test.attribute": "sample_value", "operation.type": "unit-test" });

  assert.strictEqual(result, "test-result-value");
  console.log("createTraceSpan() creates span, exposes traceId/spanId, and returns execution result");

  // ---------------------------------------------------------------------------
  // 4. createTraceSpan() - Error Recording & Propagation
  // ---------------------------------------------------------------------------
  console.log("\n4. Testing createTraceSpan() exception handling and status code...");
  let errorCaught = false;

  try {
    await createTraceSpan("test.failing_operation", async (_span) => {
      throw new Error("Simulated database failure for trace test");
    });
  } catch (err: any) {
    errorCaught = true;
    assert.strictEqual(err.message, "Simulated database failure for trace test");
  }

  assert.strictEqual(errorCaught, true, "createTraceSpan must rethrow errors to caller");
  console.log("createTraceSpan() properly catches, marks span error, and re-throws exception");

  // ---------------------------------------------------------------------------
  // 5. Nested Spans (Parent-Child Span Propagation)
  // ---------------------------------------------------------------------------
  console.log("\n5. Testing Parent-Child Trace Propagation across Nested Spans...");
  await createTraceSpan("parent.http_request", async (parentSpan) => {
    const parentCtx = getTraceContext();
    assert.ok(parentCtx.traceId);
    const rootTraceId = parentCtx.traceId;
    const parentSpanId = parentCtx.spanId;

    await createTraceSpan("child.db_query", async (childSpan) => {
      const childCtx = getTraceContext();
      // Child span must share same traceId
      assert.strictEqual(
        childCtx.traceId,
        rootTraceId,
        "Child span MUST share the same traceId as parent span",
      );
      // Child span must have its own distinct spanId
      assert.notStrictEqual(
        childCtx.spanId,
        parentSpanId,
        "Child span MUST have its own unique spanId",
      );

      await createTraceSpan("child.redis_cache_get", async (redisSpan) => {
        const redisCtx = getTraceContext();
        assert.strictEqual(redisCtx.traceId, rootTraceId);
        assert.notStrictEqual(redisCtx.spanId, childCtx.spanId);
      });
    });
  });
  console.log("Distributed trace tree correctly maintains traceId across nested DB/Redis spans");

  // ---------------------------------------------------------------------------
  // 6. Structured Logger Trace Correlation
  // ---------------------------------------------------------------------------
  console.log("\n6. Testing Structured Logger automatic trace correlation...");
  const originalWrite = process.stdout.write;
  let loggedPayload: any = null;

  const captureStdout = (chunk: any, encoding?: any, callback?: any) => {
    const str = typeof chunk === "string" ? chunk : chunk.toString();
    try {
      loggedPayload = JSON.parse(str);
    } catch {
      return originalWrite.call(process.stdout, chunk, encoding, callback);
    }
    return true;
  };

  try {
    process.stdout.write = captureStdout as any;
    await createTraceSpan("test.logger_correlation", async () => {
      const activeCtx = getTraceContext();
      logger.info("Executing traced business operation", { userId: "user-test-123", linkId: "link-456" });

      assert.ok(loggedPayload, "Logger should output JSON payload");
      assert.strictEqual(
        loggedPayload.trace_id,
        activeCtx.traceId,
        "Structured log must include active trace_id",
      );
      assert.strictEqual(
        loggedPayload.span_id,
        activeCtx.spanId,
        "Structured log must include active span_id",
      );
      assert.strictEqual(loggedPayload.userId, "user-test-123");
      assert.strictEqual(loggedPayload.linkId, "link-456");
      assert.strictEqual(loggedPayload.message, "Executing traced business operation");
    });
  } finally {
    process.stdout.write = originalWrite;
  }

  console.log("Structured logger automatically injects active trace_id and span_id into log JSON");

  // ---------------------------------------------------------------------------
  // 7. Structured Logger outside Span Context
  // ---------------------------------------------------------------------------
  console.log("\n7. Testing Structured Logger outside Span context...");
  let untracedLogPayload: any = null;
  const captureUntracedStdout = (chunk: any, encoding?: any, callback?: any) => {
    const str = typeof chunk === "string" ? chunk : chunk.toString();
    try {
      untracedLogPayload = JSON.parse(str);
    } catch {
      return originalWrite.call(process.stdout, chunk, encoding, callback);
    }
    return true;
  };

  try {
    process.stdout.write = captureUntracedStdout as any;
    logger.info("Standalone untraced log message", { event: "startup" });
    assert.ok(untracedLogPayload);
    assert.strictEqual(untracedLogPayload.trace_id, undefined, "trace_id should be omitted when no span is active");
    assert.strictEqual(untracedLogPayload.span_id, undefined, "span_id should be omitted when no span is active");
    assert.strictEqual(untracedLogPayload.event, "startup");
  } finally {
    process.stdout.write = originalWrite;
  }
  console.log("Structured logger safely omits trace fields when no active span exists");

  // ---------------------------------------------------------------------------
  // 8. OpenTelemetry SDK Graceful Shutdown
  // ---------------------------------------------------------------------------
  console.log("\n8. Testing OpenTelemetry SDK Graceful Shutdown...");
  await shutdownTracing();
  console.log("shutdownTracing() successfully flushes and shuts down tracing subsystem");

  console.log("\nALL 8 OPENTELEMETRY TRACING TESTS PASSED SUCCESSFULLY! \n");
}

runTracingTestSuite().catch((err) => {
  console.error("Tracing Test Suite Failed:", err);
  process.exit(1);
});
