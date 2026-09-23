import assert from "node:assert";
import http from "node:http";
import crypto from "node:crypto";
import { logger, pinoInstance, scrubSensitiveData } from "../src/lib/logger.ts";
import { runWithContext, updateUserContext, getRequestId, getUserId } from "../src/lib/request-context.ts";
import { requestIdMiddleware } from "../src/middlewares/request-id.middleware.ts";
import { createTraceSpan } from "../src/utils/tracing-utils.ts";
import { stopBusinessMetricsRefresher } from "../src/lib/metrics.ts";
import app from "../main.ts";

async function runLoggerTestSuite() {
  console.log("Starting Pino Structured Logging & Async Request Correlation Test Suite...\n");

  const capturedLogs: Array<Record<string, unknown>> = [];
  const originalWrite = process.stdout.write;

  function startLogCapture() {
    capturedLogs.length = 0;
    process.stdout.write = (chunk: any, encoding?: any, callback?: any) => {
      const str = typeof chunk === "string" ? chunk : chunk.toString();
      try {
        const parsed = JSON.parse(str);
        capturedLogs.push(parsed);
      } catch {
        // Not a JSON log line, allow printing to terminal for test output
        return originalWrite.call(process.stdout, chunk, encoding, callback);
      }
      return true;
    };
  }

  function stopLogCapture() {
    process.stdout.write = originalWrite;
  }

  try {
    // -------------------------------------------------------------------------
    // 1. Structured JSON Output & Core Required Fields
    // -------------------------------------------------------------------------
    console.log("1. Testing Structured JSON Schema & Core Required Fields...");
    startLogCapture();

    logger.info("Application initialized successfully", { event: "app.init" });
    logger.warn("Transient cache warning", { event: "cache.warning" });
    logger.error("Operation failure", { event: "op.fail" });
    logger.debug("Detailed diagnostic message", { event: "diag.debug" });

    stopLogCapture();

    assert.strictEqual(capturedLogs.length, 4, "Should have captured 4 JSON logs");

    for (const log of capturedLogs) {
      assert.ok(log.timestamp, "Log must contain 'timestamp'");
      assert.ok(typeof log.timestamp === "string", "'timestamp' must be string");
      assert.ok(!isNaN(Date.parse(log.timestamp as string)), "'timestamp' must be valid ISO-8601");

      assert.ok(log.level, "Log must contain 'level'");
      assert.ok(typeof log.level === "string", "'level' must be string label");

      assert.ok("requestId" in log, "Log must contain 'requestId' key");
      assert.ok("userId" in log, "Log must contain 'userId' key");
      assert.ok(log.message, "Log must contain 'message'");
      assert.ok(typeof log.message === "string", "'message' must be string");
    }

    console.log("All log lines strictly emit valid structured JSON with required schema fields");

    // -------------------------------------------------------------------------
    // 2. Non-HTTP Context (Null Defaults)
    // -------------------------------------------------------------------------
    console.log("\n2. Testing Non-HTTP / Worker Context (requestId & userId default to null)...");
    startLogCapture();

    logger.info("Worker startup outside HTTP", { queue: "click-tracking" });
    stopLogCapture();

    const nonHttpLog = capturedLogs[0];
    assert.strictEqual(nonHttpLog.requestId, null, "requestId must be null when outside HTTP request context");
    assert.strictEqual(nonHttpLog.userId, null, "userId must be null when outside user context");
    assert.strictEqual(nonHttpLog.queue, "click-tracking");

    console.log("Non-HTTP logs safely default requestId and userId to null without fabricating identifiers");

    // -------------------------------------------------------------------------
    // 3. AsyncLocalStorage Request Context Propagation Across Async Boundaries
    // -------------------------------------------------------------------------
    console.log("\n3. Testing AsyncLocalStorage Request Context Propagation...");
    startLogCapture();

    const testReqId = "req_test_abc123";
    const testUserId = "usr_test_user99";

    await runWithContext({ requestId: testReqId, userId: testUserId }, async () => {
      logger.info("Step 1: Request received in controller");

      // Simulate async database query delay
      await new Promise((resolve) => setTimeout(resolve, 20));
      logger.info("Step 2: Database query finished in service");

      // Simulate async Redis operation delay
      await new Promise((resolve) => setTimeout(resolve, 15));
      logger.info("Step 3: Redis cache updated");
    });

    stopLogCapture();

    const testLogs = capturedLogs.filter((l) => l.requestId === testReqId);
    assert.strictEqual(testLogs.length, 3, "Expected 3 logs inside async flow");
    for (const log of testLogs) {
      assert.strictEqual(log.requestId, testReqId, "requestId must propagate across all async boundaries");
      assert.strictEqual(log.userId, testUserId, "userId must propagate across all async boundaries");
    }

    console.log("AsyncLocalStorage seamlessly propagates requestId and userId through asynchronous service layers");

    // -------------------------------------------------------------------------
    // 4. Dynamic User ID Context Enrichment (Authentication)
    // -------------------------------------------------------------------------
    console.log("\n4. Testing User ID Context Enrichment upon Authentication...");
    startLogCapture();

    await runWithContext({ requestId: "req_auth_flow_456", userId: null }, async () => {
      logger.info("Anonymous request enters middleware");

      // Authenticate user
      const authenticatedUserId = "usr_authenticated_777";
      updateUserContext(authenticatedUserId);

      logger.info("Protected controller processing request");
    });

    stopLogCapture();

    const authLogs = capturedLogs.filter((l) => l.requestId === "req_auth_flow_456");
    assert.strictEqual(authLogs.length, 2);
    assert.strictEqual(authLogs[0].requestId, "req_auth_flow_456");
    assert.strictEqual(authLogs[0].userId, null, "Initial log should have userId: null");
    assert.strictEqual(authLogs[1].requestId, "req_auth_flow_456");
    assert.strictEqual(authLogs[1].userId, "usr_authenticated_777", "Subsequent log should contain enriched userId");

    console.log("updateUserContext() safely updates active request context with authenticated user ID");

    // -------------------------------------------------------------------------
    // 5. Concurrent Request Isolation (No Context Leakage)
    // -------------------------------------------------------------------------
    console.log("\n5. Testing Concurrent Request Isolation...");
    startLogCapture();

    async function simulateConcurrentRequest(id: string, userId: string, delayMs: number) {
      return runWithContext({ requestId: id, userId }, async () => {
        logger.info(`Request ${id} start`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        logger.info(`Request ${id} middle`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        logger.info(`Request ${id} end`);
      });
    }

    await Promise.all([
      simulateConcurrentRequest("req_CONCURRENT_A", "usr_A", 30),
      simulateConcurrentRequest("req_CONCURRENT_B", "usr_B", 15),
      simulateConcurrentRequest("req_CONCURRENT_C", "usr_C", 20),
    ]);

    stopLogCapture();

    const concurrentLogs = capturedLogs.filter((l) => typeof l.requestId === "string" && (l.requestId as string).startsWith("req_CONCURRENT_"));
    assert.strictEqual(concurrentLogs.length, 9, "Should have 3 logs per concurrent request (total 9)");

    for (const log of concurrentLogs) {
      if (log.requestId === "req_CONCURRENT_A") {
        assert.strictEqual(log.userId, "usr_A");
      } else if (log.requestId === "req_CONCURRENT_B") {
        assert.strictEqual(log.userId, "usr_B");
      } else if (log.requestId === "req_CONCURRENT_C") {
        assert.strictEqual(log.userId, "usr_C");
      } else {
        assert.fail(`Unexpected requestId in log: ${log.requestId}`);
      }
    }

    console.log("Zero context leakage between concurrent asynchronous requests");

    // -------------------------------------------------------------------------
    // 6. Request ID Sanitization & Response Header Echoing
    // -------------------------------------------------------------------------
    console.log("\n6. Testing Request ID Validation & Sanitization...");

    // Case A: Missing header -> generates new secure req_...
    const reqA = { headers: {} } as any;
    const resA = { setHeader: (k: string, v: string) => { resA.headers[k] = v; }, headers: {} as Record<string, string>, on: () => {} } as any;
    let nextACalled = false;
    requestIdMiddleware(reqA, resA, () => {
      nextACalled = true;
      assert.ok(reqA.id.startsWith("req_"), "Should generate req_ prefixed ID");
      assert.strictEqual(resA.headers["X-Request-ID"], reqA.id);
    });
    assert.ok(nextACalled);

    // Case B: Valid safe header -> preserved
    const reqB = { headers: { "x-request-id": "client-trace-12345_ABC" } } as any;
    const resB = { setHeader: (k: string, v: string) => { resB.headers[k] = v; }, headers: {} as Record<string, string>, on: () => {} } as any;
    requestIdMiddleware(reqB, resB, () => {
      assert.strictEqual(reqB.id, "client-trace-12345_ABC");
      assert.strictEqual(resB.headers["X-Request-ID"], "client-trace-12345_ABC");
    });

    // Case C: Dangerous / injection header -> sanitized and replaced
    const reqC = { headers: { "x-request-id": "injected\nnewline\r\n{\"fake\":\"log\"}" } } as any;
    const resC = { setHeader: (k: string, v: string) => { resC.headers[k] = v; }, headers: {} as Record<string, string>, on: () => {} } as any;
    requestIdMiddleware(reqC, resC, () => {
      assert.ok(reqC.id.startsWith("req_"), "Dangerous request ID must be replaced with safe generated ID");
      assert.strictEqual(resC.headers["X-Request-ID"], reqC.id);
    });

    console.log("Request ID middleware sanitizes dangerous headers and echoes safe X-Request-ID");

    // -------------------------------------------------------------------------
    // 7. Sensitive Data Redaction
    // -------------------------------------------------------------------------
    console.log("\n7. Testing Sensitive Data Redaction in Structured Context...");
    startLogCapture();

    logger.info("Processing user checkout", {
      event: "payment.attempt",
      password: "SuperSecretPassword123!",
      token: "jwt.header.payload.signature",
      apiKey: "re_1234567890abcdef",
      cookie: "session_id=secret123",
      authorization: "Bearer secret_token_xyz",
      creditCard: "4111111111111111",
      safePublicField: "allowed_value",
    });

    stopLogCapture();

    const redactedLog = capturedLogs[0];
    assert.strictEqual(redactedLog.password, "[REDACTED]");
    assert.strictEqual(redactedLog.token, "[REDACTED]");
    assert.strictEqual(redactedLog.apiKey, "[REDACTED]");
    assert.strictEqual(redactedLog.cookie, "[REDACTED]");
    assert.strictEqual(redactedLog.authorization, "[REDACTED]");
    assert.strictEqual(redactedLog.creditCard, "[REDACTED]");
    assert.strictEqual(redactedLog.safePublicField, "allowed_value");

    console.log("All sensitive keys (passwords, tokens, cookies, auth headers) are automatically redacted");

    // -------------------------------------------------------------------------
    // 8. Structured Error Logging
    // -------------------------------------------------------------------------
    console.log("\n8. Testing Structured Error Logging...");
    startLogCapture();

    const sampleError = new Error("Database timeout on user lookup");
    logger.error("Failed database operation", { route: "/api/v1/links", statusCode: 500 }, sampleError);

    stopLogCapture();

    const errorLog = capturedLogs[0];
    assert.strictEqual(errorLog.level, "error");
    assert.strictEqual(errorLog.message, "Failed database operation");
    assert.strictEqual(errorLog.statusCode, 500);
    assert.strictEqual(errorLog.route, "/api/v1/links");
    assert.ok(errorLog.error, "Log must contain structured error object");
    assert.strictEqual((errorLog.error as any).name, "Error");
    assert.strictEqual((errorLog.error as any).message, "Database timeout on user lookup");
    assert.ok((errorLog.error as any).stack, "Error stack should be recorded");

    console.log("Errors are cleanly serialized with name, message, stack, and context");

    // -------------------------------------------------------------------------
    // 9. OpenTelemetry Trace Correlation (traceId & spanId)
    // -------------------------------------------------------------------------
    console.log("\n9. Testing OpenTelemetry Trace Correlation in Pino Logs...");
    startLogCapture();

    await createTraceSpan("test.pino_otel_span", async (span) => {
      logger.info("Executing traced database query", { event: "db.query.start" });
    });

    stopLogCapture();

    const tracedLog = capturedLogs[0];
    assert.ok(tracedLog.traceId, "Traced log must contain 'traceId'");
    assert.ok(tracedLog.spanId, "Traced log must contain 'spanId'");
    assert.strictEqual(typeof tracedLog.traceId, "string");
    assert.strictEqual((tracedLog.traceId as string).length, 32);

    console.log("OpenTelemetry traceId and spanId are automatically injected into Pino log JSON");

    // -------------------------------------------------------------------------
    // 10. End-to-End Express HTTP Request Lifecycle & Header Validation
    // -------------------------------------------------------------------------
    console.log("\n10. Testing Express HTTP End-to-End Request Correlation...");
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const address = server.address() as { port: number };
    const baseUrl = `http://127.0.0.1:${address.port}`;

    try {
      startLogCapture();

      const res = await fetch(`${baseUrl}/health`, {
        headers: { "X-Request-ID": "test-client-http-req-999" },
      });

      stopLogCapture();

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get("x-request-id"), "test-client-http-req-999");

      // Verify completion log
      const httpCompletionLog = capturedLogs.find((l) => l.event === "http.request.completed");
      assert.ok(httpCompletionLog, "Should emit http.request.completed log");
      assert.strictEqual(httpCompletionLog.requestId, "test-client-http-req-999");
      assert.strictEqual(httpCompletionLog.method, "GET");
      assert.strictEqual(httpCompletionLog.statusCode, 200);
      assert.ok(typeof httpCompletionLog.durationMs === "number");

      console.log("End-to-end HTTP request completes with X-Request-ID and structured completion log");
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }

    console.log("\nALL 10 PINO LOGGING & REQUEST CONTEXT TESTS PASSED SUCCESSFULLY! \n");
  } finally {
    stopLogCapture();
    stopBusinessMetricsRefresher();
  }
}

runLoggerTestSuite().catch((err) => {
  console.error("Logger Test Suite Failed:", err);
  process.exit(1);
});
