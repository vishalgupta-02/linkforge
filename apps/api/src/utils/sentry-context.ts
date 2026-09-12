import type { Request } from "express";
import { Sentry } from "../lib/sentry.ts";
import { prisma } from "../db/client.ts";

/**
 * Extracts a normalized, low-cardinality endpoint string from the Express request.
 * Prefers the matched route pattern (e.g. `/api/v1/users/:id`).
 * Falls back to normalizing dynamic IDs from the path if no route pattern is available.
 */
export function getRoutePattern(req: Request): string {
  if (req.route?.path) {
    const base = req.baseUrl || "";
    const routePath = req.route.path === "/" && base ? "" : req.route.path;
    return `${base}${routePath}`;
  }

  const rawPath = (req.originalUrl || req.path || "").split("?")[0];
  if (!rawPath) return "/";

  // Replace UUIDs
  let normalized = rawPath.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    ":id",
  );
  // Replace numeric IDs
  normalized = normalized.replace(/\/\d+(?=\/|$)/g, "/:id");

  return normalized;
}

/**
 * Formats a plan name to a standardized, lowercase identifier (e.g. "free", "pro", "business").
 */
export function formatPlan(plan?: string | null): string {
  if (!plan) return "free";
  const normalized = plan.toLowerCase();
  if (normalized === "free" || normalized === "pro" || normalized === "business") {
    return normalized;
  }
  return normalized;
}

/**
 * Enriches and captures an exception in Sentry with rich, request-scoped context.
 * Guarantees complete scope isolation to prevent user context leakage between requests.
 */
export async function captureSentryWithRichContext(
  err: unknown,
  req: Request,
  customPrisma: typeof prisma = prisma,
): Promise<string | undefined> {
  if (!process.env.SENTRY_DSN) {
    return undefined;
  }

  let userId: string | undefined = req.user?.id;
  let username: string | null = req.user?.userName || req.user?.username || null;
  let plan: string | null = req.user?.plan ? formatPlan(req.user.plan) : null;

  // If user is authenticated by ID but username/plan was not loaded on req.user,
  // do a safe fallback lookup on error only (never blocks normal traffic)
  if (userId && (!username || !plan)) {
    try {
      const dbUser = await customPrisma.user.findUnique({
        where: { id: userId },
        select: { userName: true, plan: true },
      });
      if (dbUser) {
        username = username || dbUser.userName;
        plan = plan || formatPlan(dbUser.plan);
      }
    } catch {
      // Fallback silently if DB is unreachable to never break error response
    }
  }

  const endpoint = getRoutePattern(req);
  const httpMethod = req.method;

  let eventId: string | undefined;

  // Use withScope to ensure complete request isolation
  Sentry.withScope((scope) => {
    // 1. User Context (minimal safe identifier: id, username only)
    if (userId) {
      scope.setUser({
        id: userId,
        ...(username ? { username } : {}),
      });
    } else {
      scope.setUser(null);
    }

    // 2. Low-cardinality Sentry Tags & correlation
    scope.setTag("endpoint", endpoint);
    scope.setTag("method", httpMethod);

    if (req.id || req.requestId) {
      scope.setTag("requestId", (req.id || req.requestId)!);
    }

    if (plan && userId) {
      scope.setTag("plan", plan);
    }

    // 3. Structured Request Context (excluding sensitive headers, cookies, tokens)
    scope.setContext("request_details", {
      method: httpMethod,
      endpoint,
      path: req.path,
      requestId: req.id || req.requestId,
    });

    eventId = Sentry.captureException(err);
  });

  return eventId;
}

/**
 * Helper to wrap custom operations in a Sentry span when manual instrumentation is needed.
 */
export async function trackSpan<T>(
  options: { name: string; op?: string },
  fn: () => Promise<T> | T,
): Promise<T> {
  return Sentry.startSpan(options, fn);
}
