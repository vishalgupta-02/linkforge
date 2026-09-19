import client from "prom-client";
import { prisma } from "../db/client.ts";
import { clickQueue } from "../queues/click.queue.ts";

export const register = new client.Registry();

register.setDefaultLabels({
  app: "linkforge-api",
});

client.collectDefaultMetrics({
  register,
});

export const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests processed by the Express API",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [register],
});

export const httpRequestDurationHistogram = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

export const activeUsersGauge = new client.Gauge({
  name: "active_users_total",
  help: "Current number of active users with valid unexpired sessions",
  registers: [register],
});

export const linksCreatedCounter = new client.Counter({
  name: "links_created_total",
  help: "Total number of links successfully created and persisted",
  registers: [register],
});

export const clicksProcessedCounter = new client.Counter({
  name: "clicks_processed_total",
  help: "Total number of click events successfully processed by the worker",
  registers: [register],
});

export const queueDepthGauge = new client.Gauge({
  name: "queue_depth",
  help: "Current number of pending jobs in the click tracking queue",
  registers: [register],
});

export const userSignupsCounter = new client.Counter({
  name: "user_signups_total",
  help: "Total number of new user accounts successfully created and persisted",
  registers: [register],
});

export const subscriptionUpgradesCounter = new client.Counter({
  name: "subscription_upgrades_total",
  help: "Total number of successful subscription upgrades",
  labelNames: ["plan"] as const,
  registers: [register],
});

export function recordLinkCreated(count = 1): void {
  try {
    linksCreatedCounter.inc(count);
  } catch {

  }
}

export function recordClickProcessed(count = 1): void {
  try {
    clicksProcessedCounter.inc(count);
  } catch {

  }
}

export function recordUserSignup(count = 1): void {
  try {
    userSignupsCounter.inc(count);
  } catch {

  }
}

export function recordSubscriptionUpgrade(plan = "PRO", count = 1): void {
  try {
    subscriptionUpgradesCounter.inc({ plan }, count);
  } catch {

  }
}

export function setActiveUsers(count: number): void {
  try {
    activeUsersGauge.set(count);
  } catch {

  }
}

export function setQueueDepth(depth: number): void {
  try {
    queueDepthGauge.set(depth);
  } catch {

  }
}

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

export async function refreshActiveUsersMetric(
  customPrisma: typeof prisma = prisma,
): Promise<number> {
  const count = await getActiveUsersCount(customPrisma);
  setActiveUsers(count);
  return count;
}

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

export async function refreshQueueDepthMetric(
  customQueue: typeof clickQueue = clickQueue,
): Promise<number> {
  const depth = await getClickQueueDepth(customQueue);
  setQueueDepth(depth);
  return depth;
}

export async function refreshAllBusinessMetrics(
  customPrisma: typeof prisma = prisma,
  customQueue: typeof clickQueue = clickQueue,
): Promise<void> {
  await Promise.allSettled([
    refreshActiveUsersMetric(customPrisma),
    refreshQueueDepthMetric(customQueue),
  ]);
}

let metricsRefresherTimer: NodeJS.Timeout | null = null;

export function startBusinessMetricsRefresher(
  intervalMs = 30000,
  customPrisma: typeof prisma = prisma,
  customQueue: typeof clickQueue = clickQueue,
): NodeJS.Timeout | null {
  if (metricsRefresherTimer) {
    return metricsRefresherTimer;
  }

  refreshAllBusinessMetrics(customPrisma, customQueue).catch(() => {});

  metricsRefresherTimer = setInterval(() => {
    refreshAllBusinessMetrics(customPrisma, customQueue).catch(() => {});
  }, intervalMs);

  if (metricsRefresherTimer.unref) {
    metricsRefresherTimer.unref();
  }

  return metricsRefresherTimer;
}

export function stopBusinessMetricsRefresher(): void {
  if (metricsRefresherTimer) {
    clearInterval(metricsRefresherTimer);
    metricsRefresherTimer = null;
  }
}

export async function getMetrics(): Promise<string> {
  await refreshAllBusinessMetrics().catch(() => {});
  return register.metrics();
}

export function getMetricsContentType(): string {
  return register.contentType;
}

export function resetMetrics(): void {
  register.resetMetrics();
  activeUsersGauge.set(0);
  queueDepthGauge.set(0);
}
