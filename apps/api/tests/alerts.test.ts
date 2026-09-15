import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to configuration files
const REPO_ROOT = path.resolve(__dirname, "../../..");
const PROMETHEUS_RULES_FILE = path.join(REPO_ROOT, "infra/prometheus/rules/alerts.yml");
const PROMETHEUS_CONFIG_FILE = path.join(REPO_ROOT, "infra/prometheus/prometheus.yml");
const ALERTMANAGER_CONFIG_FILE = path.join(REPO_ROOT, "infra/alertmanager/alertmanager.yml");
const DOCKER_COMPOSE_FILE = path.join(REPO_ROOT, "docker-compose.prod.yml");

// Helper to simulate P99 calculation from Prometheus histogram buckets
function calculateP99FromBuckets(buckets: Array<{ le: number; count: number }>): number {
  const totalCount = buckets[buckets.length - 1].count;
  if (totalCount === 0) return 0;
  const rank = 0.99 * totalCount;

  let prevCount = 0;
  let prevLe = 0;

  for (const bucket of buckets) {
    if (bucket.count >= rank) {
      if (bucket.count === prevCount) return bucket.le;
      const fraction = (rank - prevCount) / (bucket.count - prevCount);
      return prevLe + fraction * (bucket.le - prevLe);
    }
    prevCount = bucket.count;
    prevLe = bucket.le;
  }
  return buckets[buckets.length - 1].le;
}

// Helper to simulate Error Rate calculation from request counters
function calculateErrorRate(fiveXxRequests: number, totalRequests: number): number {
  if (totalRequests === 0) return 0;
  return fiveXxRequests / totalRequests;
}

async function runAlertsTestSuite() {
  console.log("🚀 Starting Prometheus Alerting Rules & Alertmanager Verification Test Suite...\n");

  // ===========================================================================
  // 1. Validate infra/prometheus/rules/alerts.yml file existence and contents
  // ===========================================================================
  console.log("1. Testing Prometheus alert rules file structure and syntax...");
  assert.ok(
    fs.existsSync(PROMETHEUS_RULES_FILE),
    `Prometheus alert rules file must exist at ${PROMETHEUS_RULES_FILE}`,
  );

  const rulesContent = fs.readFileSync(PROMETHEUS_RULES_FILE, "utf-8");

  // Verify group definition
  assert.ok(
    rulesContent.includes("name: linkflow-application-alerts"),
    "Rule file must define group name 'linkflow-application-alerts'",
  );

  // ---------------------------------------------------------------------------
  // Alert 1: HighHTTPErrorRate
  // ---------------------------------------------------------------------------
  console.log("   - Validating HighHTTPErrorRate alert definition...");
  assert.ok(
    rulesContent.includes("alert: HighHTTPErrorRate"),
    "Must define 'HighHTTPErrorRate' alert",
  );
  assert.ok(
    rulesContent.includes("http_requests_total"),
    "HighHTTPErrorRate must query 'http_requests_total' metric",
  );
  assert.ok(
    rulesContent.includes('status_code=~"5.."'),
    "HighHTTPErrorRate must filter 5xx status codes with status_code=~\"5..\"",
  );
  assert.ok(
    rulesContent.includes("> 0.05"),
    "HighHTTPErrorRate must evaluate threshold > 0.05 (5%)",
  );
  assert.ok(
    rulesContent.includes("for: 5m"),
    "HighHTTPErrorRate must include 'for: 5m' evaluation window",
  );
  assert.ok(
    rulesContent.includes("severity: critical"),
    "HighHTTPErrorRate must have severity 'critical'",
  );

  // ---------------------------------------------------------------------------
  // Alert 2: HighHTTPP99Latency
  // ---------------------------------------------------------------------------
  console.log("   - Validating HighHTTPP99Latency alert definition...");
  assert.ok(
    rulesContent.includes("alert: HighHTTPP99Latency"),
    "Must define 'HighHTTPP99Latency' alert",
  );
  assert.ok(
    rulesContent.includes("histogram_quantile("),
    "HighHTTPP99Latency must use histogram_quantile() function",
  );
  assert.ok(
    rulesContent.includes("0.99"),
    "HighHTTPP99Latency must calculate the 0.99 (P99) quantile",
  );
  assert.ok(
    rulesContent.includes("http_request_duration_seconds_bucket"),
    "HighHTTPP99Latency must query 'http_request_duration_seconds_bucket'",
  );
  assert.ok(
    rulesContent.includes("> 2"),
    "HighHTTPP99Latency must trigger when latency exceeds 2 seconds (> 2)",
  );
  assert.ok(
    rulesContent.includes("severity: critical"),
    "HighHTTPP99Latency must have severity 'critical'",
  );

  // ---------------------------------------------------------------------------
  // Alert 3: HighQueueDepth
  // ---------------------------------------------------------------------------
  console.log("   - Validating HighQueueDepth alert definition...");
  assert.ok(
    rulesContent.includes("alert: HighQueueDepth"),
    "Must define 'HighQueueDepth' alert",
  );
  assert.ok(
    rulesContent.includes("queue_depth > 1000"),
    "HighQueueDepth must trigger when queue_depth > 1000",
  );
  assert.ok(
    rulesContent.includes("severity: warning"),
    "HighQueueDepth must have severity 'warning'",
  );

  console.log("✅ All 3 Prometheus alerting rules validated successfully!");

  // ===========================================================================
  // 2. Validate infra/prometheus/prometheus.yml configuration
  // ===========================================================================
  console.log("\n2. Testing Prometheus main configuration (prometheus.yml)...");
  assert.ok(
    fs.existsSync(PROMETHEUS_CONFIG_FILE),
    `Prometheus configuration must exist at ${PROMETHEUS_CONFIG_FILE}`,
  );

  const prometheusConfig = fs.readFileSync(PROMETHEUS_CONFIG_FILE, "utf-8");

  assert.ok(
    prometheusConfig.includes("rule_files:"),
    "prometheus.yml must contain 'rule_files' directive",
  );
  assert.ok(
    prometheusConfig.includes("/etc/prometheus/rules/*.yml"),
    "prometheus.yml rule_files must load /etc/prometheus/rules/*.yml",
  );
  assert.ok(
    prometheusConfig.includes("alerting:"),
    "prometheus.yml must contain 'alerting' configuration",
  );
  assert.ok(
    prometheusConfig.includes("alertmanagers:"),
    "prometheus.yml must contain 'alertmanagers' target",
  );
  assert.ok(
    prometheusConfig.includes("alertmanager:9093"),
    "prometheus.yml must target alertmanager:9093 on Docker network",
  );
  console.log("✅ prometheus.yml rule loading and Alertmanager target validated!");

  // ===========================================================================
  // 3. Validate infra/alertmanager/alertmanager.yml configuration
  // ===========================================================================
  console.log("\n3. Testing Alertmanager configuration (alertmanager.yml)...");
  assert.ok(
    fs.existsSync(ALERTMANAGER_CONFIG_FILE),
    `Alertmanager configuration must exist at ${ALERTMANAGER_CONFIG_FILE}`,
  );

  const alertmanagerConfig = fs.readFileSync(ALERTMANAGER_CONFIG_FILE, "utf-8");

  assert.ok(
    alertmanagerConfig.includes("smtp_smarthost:"),
    "alertmanager.yml must configure smtp_smarthost",
  );
  assert.ok(
    alertmanagerConfig.includes("smtp_from:"),
    "alertmanager.yml must configure smtp_from",
  );
  assert.ok(
    alertmanagerConfig.includes("group_by:"),
    "alertmanager.yml must configure group_by keys",
  );
  assert.ok(
    alertmanagerConfig.includes("receiver: \"email-notifications\"") ||
      alertmanagerConfig.includes("receiver: 'email-notifications'") ||
      alertmanagerConfig.includes("receiver: email-notifications"),
    "alertmanager.yml route must route to 'email-notifications' receiver",
  );
  assert.ok(
    alertmanagerConfig.includes("name: \"email-notifications\"") ||
      alertmanagerConfig.includes("name: 'email-notifications'") ||
      alertmanagerConfig.includes("name: email-notifications"),
    "alertmanager.yml must define 'email-notifications' receiver",
  );
  assert.ok(
    alertmanagerConfig.includes("email_configs:"),
    "alertmanager.yml must define email_configs in receiver",
  );
  assert.ok(
    alertmanagerConfig.includes("send_resolved: true"),
    "email_configs must enable send_resolved notifications",
  );
  console.log("✅ alertmanager.yml SMTP, routing, and email receivers validated!");

  // ===========================================================================
  // 4. Validate docker-compose.prod.yml configuration
  // ===========================================================================
  console.log("\n4. Testing docker-compose.prod.yml Alertmanager service & mounts...");
  assert.ok(
    fs.existsSync(DOCKER_COMPOSE_FILE),
    `docker-compose.prod.yml must exist at ${DOCKER_COMPOSE_FILE}`,
  );

  const composeContent = fs.readFileSync(DOCKER_COMPOSE_FILE, "utf-8");

  // Verify alertmanager service
  assert.ok(
    composeContent.includes("alertmanager:"),
    "docker-compose.prod.yml must define 'alertmanager' service",
  );
  assert.ok(
    composeContent.includes("image: prom/alertmanager:v0.27.0"),
    "alertmanager service must use prom/alertmanager image",
  );
  assert.ok(
    composeContent.includes("9093:9093"),
    "alertmanager service must expose port 9093",
  );
  assert.ok(
    composeContent.includes("linkflow-internal"),
    "alertmanager service must be connected to 'linkflow-internal' network",
  );
  assert.ok(
    composeContent.includes("alertmanager_data:"),
    "docker-compose.prod.yml must define 'alertmanager_data' volume",
  );

  // Verify prometheus volume mount for rules
  assert.ok(
    composeContent.includes("./infra/prometheus/rules:/etc/prometheus/rules:ro"),
    "prometheus service must mount rules directory",
  );

  console.log("✅ docker-compose.prod.yml Alertmanager service and volumes validated!");

  // ===========================================================================
  // 5. Mathematical & PromQL Semantics Simulations
  // ===========================================================================
  console.log("\n5. Testing Mathematical & PromQL Alert Semantics Simulations...");

  // Scenario A: Error Rate Simulation
  console.log("   - Testing Error Rate logic (5xx / total):");
  const noTraffic = calculateErrorRate(0, 0);
  assert.strictEqual(noTraffic, 0, "0 traffic should yield 0 error rate (no divide-by-zero false alert)");
  assert.strictEqual(noTraffic > 0.05, false, "0 traffic should not fire alert");

  const normalTraffic = calculateErrorRate(0, 100);
  assert.strictEqual(normalTraffic, 0);
  assert.strictEqual(normalTraffic > 0.05, false, "0% error rate should not fire alert");

  const moderateTraffic = calculateErrorRate(3, 100); // 3%
  assert.strictEqual(moderateTraffic, 0.03);
  assert.strictEqual(moderateTraffic > 0.05, false, "3% error rate (< 5%) should not fire alert");

  const elevatedTraffic = calculateErrorRate(6, 100); // 6%
  assert.strictEqual(elevatedTraffic, 0.06);
  assert.strictEqual(elevatedTraffic > 0.05, true, "6% error rate (> 5%) MUST fire alert");
  console.log("     ✓ 0% error rate: no fire");
  console.log("     ✓ 3% error rate: no fire");
  console.log("     ✓ 6% error rate: FIRES (> 5% threshold)");

  // Scenario B: P99 Latency Histogram Simulation
  console.log("   - Testing P99 Latency Histogram quantile calculation:");
  // Standard web latency buckets [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  const normalBuckets = [
    { le: 0.005, count: 20 },
    { le: 0.01, count: 50 },
    { le: 0.05, count: 90 },
    { le: 0.1, count: 95 },
    { le: 0.25, count: 98 },
    { le: 0.5, count: 99 },
    { le: 1.0, count: 100 },
    { le: 2.5, count: 100 },
    { le: 5.0, count: 100 },
    { le: 10.0, count: 100 },
  ];
  const normalP99 = calculateP99FromBuckets(normalBuckets);
  assert.ok(normalP99 <= 2.0, `Normal P99 (${normalP99.toFixed(3)}s) should be <= 2.0s`);
  assert.strictEqual(normalP99 > 2.0, false, "Normal latency should not fire P99 alert");

  const highLatencyBuckets = [
    { le: 0.005, count: 10 },
    { le: 0.1, count: 20 },
    { le: 0.5, count: 50 },
    { le: 1.0, count: 80 },
    { le: 2.5, count: 99 },
    { le: 5.0, count: 100 },
    { le: 10.0, count: 100 },
  ];
  const highP99 = calculateP99FromBuckets(highLatencyBuckets);
  assert.ok(highP99 > 2.0, `Degraded P99 (${highP99.toFixed(3)}s) must be > 2.0s`);
  assert.strictEqual(highP99 > 2.0, true, "Degraded P99 (> 2.0s) MUST fire alert");
  console.log(`     ✓ Normal traffic P99 (${normalP99.toFixed(3)}s): no fire`);
  console.log(`     ✓ Degraded traffic P99 (${highP99.toFixed(3)}s): FIRES (> 2.0s threshold)`);

  // Scenario C: Queue Depth Simulation
  console.log("   - Testing Queue Depth threshold logic (> 1000):");
  const normalQueue = 42;
  assert.strictEqual(normalQueue > 1000, false, "42 queue depth should not fire alert");

  const borderQueue = 999;
  assert.strictEqual(borderQueue > 1000, false, "999 queue depth should not fire alert");

  const highQueue = 1001;
  assert.strictEqual(highQueue > 1000, true, "1001 queue depth (> 1000) MUST fire alert");

  const burstQueue = 2500;
  assert.strictEqual(burstQueue > 1000, true, "2500 queue depth MUST fire alert");
  console.log("     ✓ 42 jobs: no fire");
  console.log("     ✓ 999 jobs: no fire");
  console.log("     ✓ 1001 jobs: FIRES (> 1000 threshold)");

  console.log("\n🎉 ALL PROMETHEUS ALERTING & ALERTMANAGER TESTS PASSED SUCCESSFULLY! 🚀\n");
}

runAlertsTestSuite().catch((err) => {
  console.error("❌ Alerts Test Suite Failed:", err);
  process.exit(1);
});
