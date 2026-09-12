import assert from "node:assert";
import type { Request, Response } from "express";
import { Sentry } from "../src/lib/sentry.ts";
import {
  getRoutePattern,
  formatPlan,
  captureSentryWithRichContext,
  trackSpan,
} from "../src/utils/sentry-context.ts";
import { errorMiddleware } from "../src/middlewares/error-handler.middleware.ts";

async function runSentryContextTests() {
  console.log("🚀 Starting Sentry Rich Context, Privacy & Performance Test Suite...\n");

  // Mock Sentry scope and capture
  let capturedScopes: Array<{
    user: any;
    tags: Record<string, string>;
    context: Record<string, any>;
    exception: any;
  }> = [];

  const originalWithScope = Sentry.withScope;
  const originalCaptureException = Sentry.captureException;
  const originalStartSpan = Sentry.startSpan;
  const originalDsn = process.env.SENTRY_DSN;

  // Ensure SENTRY_DSN is active for test
  process.env.SENTRY_DSN = "https://mock@sentry.io/123456";

  // Mock Sentry.withScope to intercept and record isolated scope state
  (Sentry as any).withScope = (callback: (scope: any) => void) => {
    const scopeState: {
      user: any;
      tags: Record<string, string>;
      context: Record<string, any>;
      exception: any;
    } = {
      user: undefined,
      tags: {},
      context: {},
      exception: null,
    };

    const mockScope = {
      setUser: (u: any) => {
        scopeState.user = u;
      },
      setTag: (key: string, value: string) => {
        scopeState.tags[key] = value;
      },
      setContext: (name: string, data: any) => {
        scopeState.context[name] = data;
      },
    };

    (Sentry as any).captureException = (err: any) => {
      scopeState.exception = err;
      capturedScopes.push(scopeState);
      return "mock-event-id";
    };

    callback(mockScope);
    return "mock-event-id";
  };

  try {
    // -------------------------------------------------------------------------
    // 1. Endpoint Pattern Extraction & Low Cardinality Tests
    // -------------------------------------------------------------------------
    console.log("1. Testing endpoint pattern extraction and low cardinality...");
    const matchedRouteReq = {
      baseUrl: "/api/v1/users",
      route: { path: "/:id" },
      path: "/api/v1/users/uuid-1234",
    } as unknown as Request;
    assert.strictEqual(getRoutePattern(matchedRouteReq), "/api/v1/users/:id");

    const rootRouteReq = {
      baseUrl: "/api/v1/billing",
      route: { path: "/" },
      path: "/api/v1/billing",
    } as unknown as Request;
    assert.strictEqual(getRoutePattern(rootRouteReq), "/api/v1/billing");

    const dynamicUuidReq = {
      originalUrl: "/api/v1/links/123e4567-e89b-12d3-a456-426614174000/clicks?date=2026-09-09",
    } as unknown as Request;
    assert.strictEqual(getRoutePattern(dynamicUuidReq), "/api/v1/links/:id/clicks");

    const dynamicNumericReq = {
      originalUrl: "/api/v1/items/987654",
    } as unknown as Request;
    assert.strictEqual(getRoutePattern(dynamicNumericReq), "/api/v1/items/:id");
    console.log("✅ Endpoint pattern extraction passed");

    // -------------------------------------------------------------------------
    // 2. Plan Normalization Tests
    // -------------------------------------------------------------------------
    console.log("2. Testing plan normalization...");
    assert.strictEqual(formatPlan("FREE"), "free");
    assert.strictEqual(formatPlan("PRO"), "pro");
    assert.strictEqual(formatPlan("BUSINESS"), "business");
    assert.strictEqual(formatPlan(undefined), "free");
    console.log("✅ Plan normalization passed");

    // -------------------------------------------------------------------------
    // 3. Authenticated Error Capture & Low-Cardinality Tags
    // -------------------------------------------------------------------------
    console.log("3. Testing authenticated error capture & cardinality separation...");
    capturedScopes = [];

    const authReq = {
      method: "POST",
      baseUrl: "/api/v1/links",
      route: { path: "/create" },
      path: "/api/v1/links/create",
      user: {
        id: "usr_alice_123",
        email: "alice@example.com",
        userName: "alice_creator",
        plan: "pro",
      },
    } as unknown as Request;

    const testError = new Error("Sentry rich context integration test");
    await captureSentryWithRichContext(testError, authReq);

    assert.strictEqual(capturedScopes.length, 1);
    const authEvent = capturedScopes[0];

    // User context: id and username (minimal safe identity)
    assert.deepStrictEqual(authEvent.user, {
      id: "usr_alice_123",
      username: "alice_creator",
    });

    // Low-cardinality Tags: endpoint, method, plan
    assert.strictEqual(authEvent.tags.endpoint, "/api/v1/links/create");
    assert.strictEqual(authEvent.tags.method, "POST");
    assert.strictEqual(authEvent.tags.plan, "pro");

    // Cardinality enforcement: username, user_id, email must NOT be tags
    assert.strictEqual(authEvent.tags.username, undefined, "username must NOT be a tag");
    assert.strictEqual(authEvent.tags.user_id, undefined, "user_id must NOT be a tag");
    assert.strictEqual(authEvent.tags.email, undefined, "email must NOT be a tag");

    // Structured Context (request_details)
    assert.strictEqual(authEvent.context.request_details.method, "POST");
    assert.strictEqual(authEvent.context.request_details.endpoint, "/api/v1/links/create");
    console.log("✅ Authenticated Sentry context and tag separation verified");

    // -------------------------------------------------------------------------
    // 4. Unauthenticated Error Capture Test
    // -------------------------------------------------------------------------
    console.log("4. Testing unauthenticated error capture...");
    capturedScopes = [];

    const unauthReq = {
      method: "GET",
      baseUrl: "/api/v1/sentry-test",
      route: { path: "/" },
      path: "/api/v1/sentry-test",
      user: undefined,
    } as unknown as Request;

    const unauthError = new Error("Sentry rich context integration test - unauthenticated");
    await captureSentryWithRichContext(unauthError, unauthReq);

    assert.strictEqual(capturedScopes.length, 1);
    const unauthEvent = capturedScopes[0];

    // User context must be null
    assert.strictEqual(unauthEvent.user, null);
    // Tags: plan, username, user_id must NOT be present
    assert.strictEqual(unauthEvent.tags.username, undefined);
    assert.strictEqual(unauthEvent.tags.user_id, undefined);
    assert.strictEqual(unauthEvent.tags.plan, undefined);
    assert.strictEqual(unauthEvent.tags.endpoint, "/api/v1/sentry-test");
    assert.strictEqual(unauthEvent.tags.method, "GET");
    console.log("✅ Unauthenticated Sentry context verified (no user leakage)");

    // -------------------------------------------------------------------------
    // 5. Context Isolation Test Between Concurrent/Different Users
    // -------------------------------------------------------------------------
    console.log("5. Testing context isolation between distinct users (Alice & Bob)...");
    capturedScopes = [];

    const reqUserA = {
      method: "GET",
      baseUrl: "/api/v1/sentry-test",
      route: { path: "/auth" },
      path: "/api/v1/sentry-test/auth",
      user: {
        id: "usr_alice_111",
        email: "alice@example.com",
        userName: "alice",
        plan: "free",
      },
    } as unknown as Request;

    const reqUserB = {
      method: "GET",
      baseUrl: "/api/v1/sentry-test",
      route: { path: "/auth" },
      path: "/api/v1/sentry-test/auth",
      user: {
        id: "usr_bob_222",
        email: "bob@example.com",
        userName: "bob",
        plan: "business",
      },
    } as unknown as Request;

    // Trigger capture sequentially and concurrently
    await Promise.all([
      captureSentryWithRichContext(new Error("Error from Alice"), reqUserA),
      captureSentryWithRichContext(new Error("Error from Bob"), reqUserB),
    ]);

    assert.strictEqual(capturedScopes.length, 2);

    const eventAlice = capturedScopes.find((s) => s.user?.id === "usr_alice_111");
    const eventBob = capturedScopes.find((s) => s.user?.id === "usr_bob_222");

    assert(eventAlice, "Event for Alice must exist");
    assert(eventBob, "Event for Bob must exist");

    assert.strictEqual(eventAlice.user.username, "alice");
    assert.strictEqual(eventAlice.tags.plan, "free");
    assert.strictEqual(eventAlice.tags.username, undefined);

    assert.strictEqual(eventBob.user.username, "bob");
    assert.strictEqual(eventBob.tags.plan, "business");
    assert.strictEqual(eventBob.tags.username, undefined);

    console.log("✅ Context isolation between multiple concurrent users verified");

    // -------------------------------------------------------------------------
    // 6. Performance Tracing & Span Wrapper Tests
    // -------------------------------------------------------------------------
    console.log("6. Testing manual span wrapper and child span creation...");
    let spanCreated = false;
    let spanName = "";

    (Sentry as any).startSpan = async (options: any, callback: any) => {
      spanCreated = true;
      spanName = options.name;
      return callback();
    };

    const spanResult = await trackSpan(
      { name: "custom-db-operation", op: "db.query" },
      async () => {
        return "query-completed";
      },
    );

    assert.strictEqual(spanCreated, true);
    assert.strictEqual(spanName, "custom-db-operation");
    assert.strictEqual(spanResult, "query-completed");
    console.log("✅ Performance span tracking verified");

    // -------------------------------------------------------------------------
    // 7. Error Middleware Preservation & HTTP Contract Integrity Test
    // -------------------------------------------------------------------------
    console.log("7. Testing error handler response preservation...");
    capturedScopes = [];

    let responseStatus: number = 0;
    let responseJson: any = null;

    const mockResponse = {
      status: (code: number) => {
        responseStatus = code;
        return {
          json: (body: any) => {
            responseJson = body;
            return body;
          },
        };
      },
    } as unknown as Response;

    const dummy500Err = new Error("Database connection failure");

    errorMiddleware(dummy500Err, authReq, mockResponse, () => {});

    // Allow any async capture promise to resolve
    await new Promise((resolve) => setTimeout(resolve, 50));

    assert.strictEqual(responseStatus, 500);
    assert.strictEqual(responseJson.success, false);
    assert.strictEqual(responseJson.message, "Database connection failure");
    assert.strictEqual(capturedScopes.length, 1);
    assert.strictEqual(capturedScopes[0].user.id, "usr_alice_123");
    console.log("✅ Error middleware contract and Sentry trigger verified");


    // -------------------------------------------------------------------------
    // 8. Request ID Middleware Tests
    // -------------------------------------------------------------------------
    console.log("8. Testing Request ID generation, propagation and header echoing...");
    const { requestIdMiddleware } = await import("../src/middlewares/request-id.middleware.ts");

    let headerName = "";
    let headerValue = "";
    const testReqWithoutId: any = {
      headers: {},
      method: "GET",
      path: "/api/v1/links",
    };
    const testRes: any = {
      setHeader: (name: string, val: string) => {
        headerName = name;
        headerValue = val;
      },
    };

    let nextCalled = false;
    requestIdMiddleware(testReqWithoutId, testRes, () => {
      nextCalled = true;
    });

    assert(nextCalled, "Next must be called");
    assert.strictEqual(headerName, "X-Request-ID");
    assert(testReqWithoutId.id, "Request ID must be generated");
    assert.strictEqual(testReqWithoutId.id, headerValue);

    // Incoming Request ID must be preserved
    const testReqWithId: any = {
      headers: { "x-request-id": "custom-trace-id-12345" },
      method: "POST",
      path: "/api/v1/links",
    };
    requestIdMiddleware(testReqWithId, testRes, () => {});
    assert.strictEqual(testReqWithId.id, "custom-trace-id-12345");
    assert.strictEqual(headerValue, "custom-trace-id-12345");
    console.log("✅ Request ID middleware tests passed");

    // -------------------------------------------------------------------------
    // 9. Structured Logging & Sensitive Data Scrubbing Tests
    // -------------------------------------------------------------------------
    console.log("9. Testing structured logging and sensitive data scrubbing...");
    const { scrubSensitiveData } = await import("../src/lib/logger.ts");

    const payloadWithSecrets = {
      userId: "usr_safe_123",
      password: "SuperSecretPassword123!",
      token: "jwt.token.here",
      stripeSignature: "sig_secret_stripe",
      nested: {
        authorization: "Bearer secret-token",
        safeMeta: "safe-value",
      },
    };

    const scrubbed = scrubSensitiveData(payloadWithSecrets) as any;
    assert.strictEqual(scrubbed.userId, "usr_safe_123");
    assert.strictEqual(scrubbed.password, "[REDACTED]");
    assert.strictEqual(scrubbed.token, "[REDACTED]");
    assert.strictEqual(scrubbed.stripeSignature, "[REDACTED]");
    assert.strictEqual(scrubbed.nested.authorization, "[REDACTED]");
    assert.strictEqual(scrubbed.nested.safeMeta, "safe-value");
    console.log("✅ Structured logging & sensitive data scrubbing passed");

    console.log("\n🎉 All Sentry Rich Context & Performance Tests PASSED successfully!");
  } finally {
    // Restore originals
    (Sentry as any).withScope = originalWithScope;
    (Sentry as any).captureException = originalCaptureException;
    (Sentry as any).startSpan = originalStartSpan;
    process.env.SENTRY_DSN = originalDsn;
  }
}

runSentryContextTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Sentry Rich Context & Performance Test Suite FAILED:", err);
    process.exit(1);
  });



