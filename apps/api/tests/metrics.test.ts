import assert from "node:assert";
import http from "node:http";
import app from "../main.ts";
import {
  register,
  getMetrics,
  getMetricsContentType,
  resetMetrics,
  httpRequestCounter,
  httpRequestDurationHistogram,
  userSignupsCounter,
  subscriptionUpgradesCounter,
  recordUserSignup,
  recordSubscriptionUpgrade,
  activeUsersGauge,
  linksCreatedCounter,
  clicksProcessedCounter,
  queueDepthGauge,
  recordLinkCreated,
  recordClickProcessed,
  setActiveUsers,
  setQueueDepth,
  getActiveUsersCount,
  getClickQueueDepth,
  refreshActiveUsersMetric,
  refreshQueueDepthMetric,
  refreshAllBusinessMetrics,
  stopBusinessMetricsRefresher,
} from "../src/lib/metrics.ts";
import { getNormalizedRoute } from "../src/middlewares/metrics.middleware.ts";

async function runMetricsTestSuite() {
  console.log("Starting Prometheus Metrics Production & Business Metrics Test Suite...\n");

  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`Ephemeral Test API Server listening at ${baseUrl}`);

  try {
    // -------------------------------------------------------------------------
    // 1. Verification of /metrics Endpoint & Prometheus Content Type
    // -------------------------------------------------------------------------
    console.log("\n1. Testing GET /metrics endpoint format and headers...");
    resetMetrics();

    const metricsRes = await fetch(`${baseUrl}/metrics`);
    assert.strictEqual(metricsRes.status, 200, "GET /metrics should return 200 OK");

    const contentType = metricsRes.headers.get("content-type");
    assert.ok(
      contentType && contentType.includes("text/plain"),
      `Content-Type header should match Prometheus standard (got: ${contentType})`,
    );

    const metricsBody = await metricsRes.text();
    assert.ok(metricsBody.length > 0, "/metrics response body should not be empty");
    console.log("/metrics returns HTTP 200 with standard Prometheus Content-Type");

    // -------------------------------------------------------------------------
    // 2. Default Process and Node.js Runtime Metrics
    // -------------------------------------------------------------------------
    console.log("\n2. Testing Default Node.js & Process metrics presence...");

    assert.ok(
      metricsBody.includes("process_cpu_user_seconds_total") ||
        metricsBody.includes("process_cpu_seconds_total"),
      "Should include CPU usage metrics",
    );
    assert.ok(
      metricsBody.includes("nodejs_heap_size_total_bytes") ||
        metricsBody.includes("process_resident_memory_bytes"),
      "Should include Memory / Heap metrics",
    );
    assert.ok(
      metricsBody.includes("nodejs_eventloop_lag_seconds") ||
        metricsBody.includes("nodejs_eventloop_lag_min_seconds"),
      "Should include Event Loop metrics",
    );
    assert.ok(
      metricsBody.includes("process_start_time_seconds"),
      "Should include process start time / uptime metrics",
    );
    console.log("Default CPU, Memory, Event Loop, and Process metrics are collected");

    // -------------------------------------------------------------------------
    // 3. HTTP Request Counter (http_requests_total) & Labels
    // -------------------------------------------------------------------------
    console.log("\n3. Testing HTTP Request Counter (http_requests_total)...");
    resetMetrics();

    const healthRes = await fetch(`${baseUrl}/health`);
    assert.strictEqual(healthRes.status, 200);

    const scrapedMetrics1 = await getMetrics();
    assert.ok(
      /http_requests_total\{[^}]*method="GET"[^}]*route="\/health"[^}]*status_code="200"[^}]*\}\s+1/.test(scrapedMetrics1),
      "http_requests_total must record GET /health status 200",
    );
    console.log("http_requests_total counter incremented with correct method, route, and status_code");

    // -------------------------------------------------------------------------
    // 4. HTTP Request Duration Histogram (http_request_duration_seconds)
    // -------------------------------------------------------------------------
    console.log("\n4. Testing HTTP Request Duration Histogram...");
    assert.ok(
      scrapedMetrics1.includes("http_request_duration_seconds_bucket"),
      "Histogram bucket metrics should be present",
    );
    assert.ok(
      scrapedMetrics1.includes("http_request_duration_seconds_count"),
      "Histogram count should be present",
    );
    assert.ok(
      scrapedMetrics1.includes("http_request_duration_seconds_sum"),
      "Histogram sum should be present",
    );
    console.log("http_request_duration_seconds histogram accurately observes request latencies");

    // -------------------------------------------------------------------------
    // 5. Error Responses Metrics Recording (4xx, 5xx)
    // -------------------------------------------------------------------------
    console.log("\n5. Testing Metrics on Error Responses (4xx, 5xx)...");

    const errRes400 = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const scrapedMetrics2 = await getMetrics();
    assert.ok(
      scrapedMetrics2.includes(`status_code="${errRes400.status}"`),
      `Metrics must capture status_code="${errRes400.status}"`,
    );
    console.log(`${errRes400.status} error response properly recorded in metrics`);

    // -------------------------------------------------------------------------
    // 6. Cardinality Safety & 404 Unmatched Route Normalization
    // -------------------------------------------------------------------------
    console.log("\n6. Testing Cardinality Safety for Unmatched Routes (404)...");

    const randomId1 = "random-uuid-" + Math.random().toString(36).substring(7);
    const randomId2 = "random-uuid-" + Math.random().toString(36).substring(7);

    const notFound1 = await fetch(`${baseUrl}/non-existent-endpoint/${randomId1}`);
    const notFound2 = await fetch(`${baseUrl}/another-weird-path/${randomId2}`);

    assert.strictEqual(notFound1.status, 404);
    assert.strictEqual(notFound2.status, 404);

    const scrapedMetrics3 = await getMetrics();
    assert.strictEqual(
      scrapedMetrics3.includes(randomId1),
      false,
      "Random 404 path segments must NEVER be leaked into Prometheus labels",
    );
    assert.strictEqual(
      scrapedMetrics3.includes(randomId2),
      false,
      "Random 404 path segments must NEVER be leaked into Prometheus labels",
    );
    assert.ok(
      scrapedMetrics3.includes('route="unknown",status_code="404"'),
      '404 responses must be safely grouped under route="unknown"',
    );
    console.log("Arbitrary 404 paths are normalized to bounded 'unknown' label");

    // -------------------------------------------------------------------------
    // 7. Parameterized Route Normalization (/api/v1/links/update/:id)
    // -------------------------------------------------------------------------
    console.log("\n7. Testing Parameterized Route Normalization...");

    const mockReqWithParams = {
      baseUrl: "/api/v1/links",
      route: { path: "/update/:id" },
      path: "/api/v1/links/update/uuid-12345",
      method: "PATCH",
    } as any;
    const mockRes200 = { statusCode: 200 } as any;

    const normalizedRoute = getNormalizedRoute(mockReqWithParams, mockRes200);
    assert.strictEqual(
      normalizedRoute,
      "/api/v1/links/update/:id",
      "Dynamic path segments in router must normalize to route pattern",
    );
    console.log("Parameterized routes preserve pattern (:id) preventing high cardinality");

    // -------------------------------------------------------------------------
    // 8. Self-Referential Scrape Exclusion (/metrics)
    // -------------------------------------------------------------------------
    console.log("\n8. Testing Self-Referential Scraping Exclusion...");
    resetMetrics();

    await fetch(`${baseUrl}/metrics`);
    await fetch(`${baseUrl}/metrics`);
    await fetch(`${baseUrl}/metrics`);

    const scrapedMetrics4 = await getMetrics();
    assert.strictEqual(
      scrapedMetrics4.includes('route="/metrics"'),
      false,
      "GET /metrics should be excluded from http_requests_total application traffic metrics",
    );
    console.log("Scraping /metrics does not inflate application request counters");

    // -------------------------------------------------------------------------
    // 9. Custom Business Metric: links_created_total (Counter)
    // -------------------------------------------------------------------------
    console.log("\n9. Testing Business Metric: links_created_total...");
    resetMetrics();

    // Verify initial state
    assert.strictEqual((await linksCreatedCounter.get()).values[0]?.value ?? 0, 0);

    // Record single creation
    recordLinkCreated();
    assert.strictEqual((await linksCreatedCounter.get()).values[0]?.value, 1);

    // Record multiple creations
    recordLinkCreated(3);
    assert.strictEqual((await linksCreatedCounter.get()).values[0]?.value, 4);

    const scrapedBusiness1 = await getMetrics();
    assert.ok(
      scrapedBusiness1.includes("links_created_total"),
      "links_created_total must appear in /metrics output",
    );
    console.log("links_created_total increments accurately and appears in /metrics output");

    // -------------------------------------------------------------------------
    // 10. Custom Business Metric: clicks_processed_total (Counter)
    // -------------------------------------------------------------------------
    console.log("\n10. Testing Business Metric: clicks_processed_total...");
    resetMetrics();

    // Verify initial state
    assert.strictEqual((await clicksProcessedCounter.get()).values[0]?.value ?? 0, 0);

    // Record single click processed
    recordClickProcessed();
    assert.strictEqual((await clicksProcessedCounter.get()).values[0]?.value, 1);

    // Record multiple clicks processed
    recordClickProcessed(5);
    assert.strictEqual((await clicksProcessedCounter.get()).values[0]?.value, 6);

    const scrapedBusiness2 = await getMetrics();
    assert.ok(
      scrapedBusiness2.includes("clicks_processed_total"),
      "clicks_processed_total must appear in /metrics output",
    );
    console.log("clicks_processed_total increments accurately on worker processing");

    // -------------------------------------------------------------------------
    // 11. Custom Business Metric: user_signups_total (Counter)
    // -------------------------------------------------------------------------
    console.log("\n11. Testing Business Metric: user_signups_total...");
    resetMetrics();

    // Verify initial state
    assert.strictEqual((await userSignupsCounter.get()).values[0]?.value ?? 0, 0);

    // Record single user signup
    recordUserSignup();
    assert.strictEqual((await userSignupsCounter.get()).values[0]?.value, 1);

    // Record multiple signups
    recordUserSignup(4);
    assert.strictEqual((await userSignupsCounter.get()).values[0]?.value, 5);

    const scrapedBusinessSignup = await getMetrics();
    assert.ok(
      scrapedBusinessSignup.includes("user_signups_total"),
      "user_signups_total must appear in /metrics output",
    );
    console.log("user_signups_total increments accurately and appears in /metrics output");

    // -------------------------------------------------------------------------
    // 12. Custom Business Metric: subscription_upgrades_total (Counter with plan label)
    // -------------------------------------------------------------------------
    console.log("\n12. Testing Business Metric: subscription_upgrades_total...");
    resetMetrics();

    // Verify initial state
    assert.strictEqual((await subscriptionUpgradesCounter.get()).values.length, 0);

    // Record single subscription upgrade
    recordSubscriptionUpgrade("PRO");
    const upgradeValues1 = (await subscriptionUpgradesCounter.get()).values;
    assert.strictEqual(upgradeValues1.length, 1);
    assert.strictEqual(upgradeValues1[0].value, 1);
    assert.strictEqual(upgradeValues1[0].labels.plan, "PRO");

    // Record additional subscription upgrades
    recordSubscriptionUpgrade("PRO", 2);
    const upgradeValues2 = (await subscriptionUpgradesCounter.get()).values;
    assert.strictEqual(upgradeValues2[0].value, 3);

    const scrapedBusinessUpgrade = await getMetrics();
    assert.ok(
      scrapedBusinessUpgrade.includes("subscription_upgrades_total"),
      "subscription_upgrades_total must appear in /metrics output",
    );
    assert.ok(
      /subscription_upgrades_total\{[^}]*plan="PRO"[^}]*\}\s+3/.test(scrapedBusinessUpgrade),
      "subscription_upgrades_total must include bounded plan label",
    );
    console.log("subscription_upgrades_total increments accurately with bounded plan label");

    // -------------------------------------------------------------------------
    // 13. Custom Business Metric: active_users_total (Gauge)
    // -------------------------------------------------------------------------
    console.log("\n13. Testing Business Metric: active_users_total...");
    resetMetrics();

    // Test direct gauge setting
    setActiveUsers(42);
    assert.strictEqual((await activeUsersGauge.get()).values[0]?.value, 42);

    // Test authoritative query with mock Prisma
    const mockPrisma = {
      session: {
        findMany: async (args: any) => {
          // Simulate 3 distinct active sessions
          return [
            { userId: "user-1" },
            { userId: "user-2" },
            { userId: "user-3" },
          ];
        },
      },
    } as any;

    const count = await refreshActiveUsersMetric(mockPrisma);
    assert.strictEqual(count, 3);
    assert.strictEqual((await activeUsersGauge.get()).values[0]?.value, 3);

    const scrapedBusiness3 = await getMetrics();
    assert.ok(
      scrapedBusiness3.includes("active_users_total"),
      "active_users_total must appear in /metrics output",
    );
    console.log("active_users_total gauge reflects active session count");

    // -------------------------------------------------------------------------
    // 14. Custom Business Metric: queue_depth (Gauge)
    // -------------------------------------------------------------------------
    console.log("\n14. Testing Business Metric: queue_depth...");
    resetMetrics();

    // Test direct gauge setting
    setQueueDepth(15);
    assert.strictEqual((await queueDepthGauge.get()).values[0]?.value, 15);

    // Test authoritative query with mock BullMQ queue
    const mockQueue = {
      getJobCounts: async (...types: string[]) => {
        return {
          waiting: 7,
          delayed: 3,
          prioritized: 2,
          completed: 100, // Should NOT be included
          failed: 5,      // Should NOT be included
        };
      },
    } as any;

    const depth = await refreshQueueDepthMetric(mockQueue);
    // Depth = waiting (7) + delayed (3) + prioritized (2) = 12
    assert.strictEqual(depth, 12);
    assert.strictEqual((await queueDepthGauge.get()).values[0]?.value, 12);

    const scrapedBusiness4 = await getMetrics();
    assert.ok(
      scrapedBusiness4.includes("queue_depth"),
      "queue_depth must appear in /metrics output",
    );
    console.log("queue_depth gauge calculates pending workload (waiting+delayed+prioritized)");

    // -------------------------------------------------------------------------
    // 15. Combined Scrape Verification: All Metrics Present
    // -------------------------------------------------------------------------
    console.log("\n15. Testing Comprehensive Scrape Output with All Metrics...");
    recordUserSignup(3);
    recordSubscriptionUpgrade("PRO", 1);
    recordLinkCreated(2);
    recordClickProcessed(10);
    setActiveUsers(5);
    setQueueDepth(3);

    const fullMetrics = await getMetrics();

    assert.ok(fullMetrics.includes("http_requests_total"), "Missing http_requests_total");
    assert.ok(fullMetrics.includes("http_request_duration_seconds"), "Missing http_request_duration_seconds");
    assert.ok(fullMetrics.includes("user_signups_total"), "Missing user_signups_total");
    assert.ok(fullMetrics.includes("subscription_upgrades_total"), "Missing subscription_upgrades_total");
    assert.ok(fullMetrics.includes("active_users_total"), "Missing active_users_total");
    assert.ok(fullMetrics.includes("links_created_total"), "Missing links_created_total");
    assert.ok(fullMetrics.includes("clicks_processed_total"), "Missing clicks_processed_total");
    assert.ok(fullMetrics.includes("queue_depth"), "Missing queue_depth");
    assert.ok(fullMetrics.includes("process_cpu_seconds_total") || fullMetrics.includes("process_cpu_user_seconds_total"), "Missing CPU metrics");
    assert.ok(fullMetrics.includes("nodejs_heap_size_total_bytes"), "Missing Heap metrics");

    console.log("Complete metrics payload contains all default, HTTP, and business metrics");

    // -------------------------------------------------------------------------
    // 16. Metric Registry Reset Isolation
    // -------------------------------------------------------------------------
    console.log("\n16. Testing Metric Registry Reset Isolation...");
    resetMetrics();
    const scrapedMetricsClean = await getMetrics();
    assert.strictEqual(
      scrapedMetricsClean.includes("http_requests_total{"),
      false,
      "resetMetrics() must reset custom HTTP counters to zero",
    );
    console.log("resetMetrics() successfully clears metric registries for test isolation");

    console.log("\nALL 16 PROMETHEUS & BUSINESS METRICS TESTS PASSED SUCCESSFULLY! \n");
  } finally {
    stopBusinessMetricsRefresher();
    server.close();
  }
}

runMetricsTestSuite().catch((err) => {
  stopBusinessMetricsRefresher();
  console.error("Metrics Test Suite Failed:", err);
  process.exit(1);
});
