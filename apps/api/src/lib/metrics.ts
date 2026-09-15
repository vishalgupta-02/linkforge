import client from "prom-client";
import { prisma } from "../db/client.ts";
import { clickQueue } from "../queues/click.queue.ts";

/**
 * Isolated Prometheus Registry dedicated to the Express API.
 * Prevents accidental global state collisions across tests or other packages.
 */
export const register = new client.Registry();

// Standard default labels (optional, can be extended per environment)
register.setDefaultLabels({
  app: "linkforge-api",
});

/**
 * Enable collection of default Node.js and OS process/runtime metrics:
 * - CPU usage (process_cpu_seconds_total, process_cpu_user_seconds_total, etc.)
 * - Memory & Heap (nodejs_heap_size_total_bytes, process_resident_memory_bytes, etc.)
 * - Event loop lag (nodejs_eventloop_lag_seconds, min/max/p50/p90/p99)
 * - Active handles & requests (nodejs_active_handles, nodejs_active_requests)
 * - Process start time & uptime (process_start_time_seconds)
 * - Garbage collection duration (if supported by environment)
 */
client.collectDefaultMetrics({
  register,
});

// ============================================================================
// 1. HTTP Network & Application Metrics
// ============================================================================

/**
 * HTTP Request Counter
 * Measures the total volume of requests handled by the Express server.
 */
export const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests processed by the Express API",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [register],
});

/**
 * HTTP Request Duration Histogram
 * Measures latency distribution of HTTP requests in seconds.
 * 
 * Latency buckets chosen for web API workloads:
 * 5ms, 10ms, 25ms, 50ms, 100ms, 250ms, 500ms, 1s, 2.5s, 5s, 10s
 */
export const httpRequestDurationHistogram = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// ============================================================================
// 2. Custom Business & Workload Metrics
// ============================================================================

/**
 * Active Users Gauge (active_users_total)
 * Represents the current count of unique users with valid, unexpired sessions.
 */
export const activeUsersGauge = new client.Gauge({
  name: "active_users_total",
  help: "Current number of active users with valid unexpired sessions",
  registers: [register],
});

/**
 * Links Created Counter (links_created_total)
 * Total number of links successfully created and persisted to the database.
 */
export const linksCreatedCounter = new client.Counter({
  name: "links_created_total",
  help: "Total number of links successfully created and persisted",
  registers: [register],
});

/**
 * Clicks Processed Counter (clicks_processed_total)
 * Total number of click events successfully processed and persisted by the worker.
 */
export const clicksProcessedCounter = new client.Counter({
  name: "clicks_processed_total",
  help: "Total number of click events successfully processed by the worker",
  registers: [register],
});

/**
 * Queue Depth Gauge (queue_depth)
 * Represents current pending workload (waiting + delayed + prioritized jobs) in the click tracking queue.
 */
export const queueDepthGauge = new client.Gauge({
  name: "queue_depth",
  help: "Current number of pending jobs in the click tracking queue",
  registers: [register],
});

/**
 * User Signups Counter (user_signups_total)
 * Total number of new user accounts successfully registered and persisted.
 */
export const userSignupsCounter = new client.Counter({
  name: "user_signups_total",
  help: "Total number of new user accounts successfully created and persisted",
  registers: [register],
});

/**
 * Subscription Upgrades Counter (subscription_upgrades_total)
 * Total number of successful subscription upgrades persisted.
 */
export const subscriptionUpgradesCounter = new client.Counter({
  name: "subscription_upgrades_total",
  help: "Total number of successful subscription upgrades",
  labelNames: ["plan"] as const,
  registers: [register],
});

// ============================================================================
// 3. Safe Helper Functions for Business Metric Updates
// ============================================================================

/**
 * Records a successful link creation.
 */
export function recordLinkCreated(count = 1): void {
  try {
    linksCreatedCounter.inc(count);
  } catch {
    // Metric recording failure must never disrupt business operations
  }
}

/**
 * Records a successfully processed click event.
 */
export function recordClickProcessed(count = 1): void {
  try {
    clicksProcessedCounter.inc(count);
  } catch {
    // Metric recording failure must never disrupt business operations
  }
}

/**
 * Records a successfully created user account.
 */
export function recordUserSignup(count = 1): void {
  try {
    userSignupsCounter.inc(count);
  } catch {
    // Metric recording failure must never disrupt business operations
  }
}

/**
 * Records a successfully completed subscription upgrade.
 */
export function recordSubscriptionUpgrade(plan = "PRO", count = 1): void {
  try {
    subscriptionUpgradesCounter.inc({ plan }, count);
  } catch {
    // Metric recording failure must never disrupt business operations
  }
}

/**
 * Sets the active users gauge value directly.
 */
export function setActiveUsers(count: number): void {
  try {
    activeUsersGauge.set(count);
  } catch {
    // Metric recording failure must never disrupt business operations
  }
}

/**
 * Sets the queue depth gauge value directly.
 */
export function setQueueDepth(depth: number): void {
  try {
    queueDepthGauge.set(depth);
  } catch {
    // Metric recording failure must never disrupt business operations
  }
}

// ============================================================================
// 4. Authoritative State Refreshers
// ============================================================================

/**
 * Queries the authoritative active user count from the database (unique users with unexpired sessions).
 */
export async function getActiveUsersCount(
  customPrisma: typeof prisma = prisma,
): Promise<number> {
  try {
    const activeSessions = await customPrisma.session.findMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    });
    return activeSessions.length;
  } catch {
    return 0;
  }
}

/**
 * Refreshes active_users_total from database state.
 */
export async function refreshActiveUsersMetric(
  customPrisma: typeof prisma = prisma,
): Promise<number> {
  const count = await getActiveUsersCount(customPrisma);
  setActiveUsers(count);
  return count;
}

/**
 * Queries current pending work (waiting + delayed + prioritized) from the click tracking queue.
 */
export async function getClickQueueDepth(
  customQueue: typeof clickQueue = clickQueue,
): Promise<number> {
  try {
    const counts = await customQueue.getJobCounts("waiting", "delayed", "prioritized");
    const depth = (counts.waiting || 0) + (counts.delayed || 0) + (counts.prioritized || 0);
    return depth;
  } catch {
    return 0;
  }
}

/**
 * Refreshes queue_depth from BullMQ queue state.
 */
export async function refreshQueueDepthMetric(
  customQueue: typeof clickQueue = clickQueue,
): Promise<number> {
  const depth = await getClickQueueDepth(customQueue);
  setQueueDepth(depth);
  return depth;
}

/**
 * Refreshes all authoritative business metrics gauges.
 */
export async function refreshAllBusinessMetrics(
  customPrisma: typeof prisma = prisma,
  customQueue: typeof clickQueue = clickQueue,
): Promise<void> {
  await Promise.allSettled([
    refreshActiveUsersMetric(customPrisma),
    refreshQueueDepthMetric(customQueue),
  ]);
}

// ============================================================================
// 5. Periodic Refresher Management
// ============================================================================

let metricsRefresherTimer: NodeJS.Timeout | null = null;

/**
 * Starts a background timer that periodically queries database and queue state
 * to keep gauge metrics up to date without adding query overhead to /metrics scrapes.
 */
export function startBusinessMetricsRefresher(
  intervalMs = 30000,
  customPrisma: typeof prisma = prisma,
  customQueue: typeof clickQueue = clickQueue,
): NodeJS.Timeout | null {
  if (metricsRefresherTimer) {
    return metricsRefresherTimer;
  }

  // Initial immediate refresh
  refreshAllBusinessMetrics(customPrisma, customQueue).catch(() => {});

  metricsRefresherTimer = setInterval(() => {
    refreshAllBusinessMetrics(customPrisma, customQueue).catch(() => {});
  }, intervalMs);

  // Allow Node process to exit cleanly if this timer is active
  if (metricsRefresherTimer.unref) {
    metricsRefresherTimer.unref();
  }

  return metricsRefresherTimer;
}

/**
 * Stops the background metrics refresher timer (essential for test isolation and clean shutdown).
 */
export function stopBusinessMetricsRefresher(): void {
  if (metricsRefresherTimer) {
    clearInterval(metricsRefresherTimer);
    metricsRefresherTimer = null;
  }
}

// ============================================================================
// 6. Metric Export & Reset Helpers
// ============================================================================

/**
 * Returns aggregated Prometheus metrics string in standard text format.
 */
export async function getMetrics(): Promise<string> {
  return register.metrics();
}

/**
 * Returns the Prometheus content type header string (e.g. text/plain; version=0.0.4).
 */
export function getMetricsContentType(): string {
  return register.contentType;
}

/**
 * Resets all registered metric values to zero (useful for test isolation).
 */
export function resetMetrics(): void {
  register.resetMetrics();
  activeUsersGauge.set(0);
  queueDepthGauge.set(0);
}
