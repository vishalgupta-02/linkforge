import type { Request } from "express";
import { Sentry } from "../lib/sentry.ts";
import { prisma } from "../db/client.ts";

export function getRoutePattern(req: Request): string {
  if (req.route?.path) {
    const base = req.baseUrl || "";
    const routePath = req.route.path === "/" && base ? "" : req.route.path;
    return `${base}${routePath}`;
  }

  const rawPath = (req.originalUrl || req.path || "").split("?")[0];
  if (!rawPath) return "/";

  let normalized = rawPath.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    ":id",
  );

  normalized = normalized.replace(/\/\d+(?=\/|$)/g, "/:id");

  return normalized;
}

export function formatPlan(plan?: string | null): string {
  if (!plan) return "free";
  const normalized = plan.toLowerCase();
  if (normalized === "free" || normalized === "pro" || normalized === "business") {
    return normalized;
  }
  return normalized;
}

export async function captureSentryWithRichContext(
  err: unknown,
  req: Request,
  customPrisma: typeof prisma = prisma,
): Promise<string | undefined> {
  if (!process.env.SENTRY_DSN) {
    return undefined;
  }

  const userId: string | undefined = req.user?.id;
  const rawUser = req.user as { userName?: string; username?: string; plan?: string } | undefined;
  let username: string | null = rawUser?.userName || rawUser?.username || null;
  let plan: string | null = rawUser?.plan ? formatPlan(rawUser.plan) : null;

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

    }
  }

  const endpoint = getRoutePattern(req);
  const httpMethod = req.method;
  const requestId = ((req as any).id || (req as any).requestId) as string | undefined;

  let eventId: string | undefined;

  Sentry.withScope((scope) => {

    if (userId) {
      scope.setUser({
        id: userId,
        ...(username ? { username } : {}),
      });
    } else {
      scope.setUser(null);
    }

    scope.setTag("endpoint", endpoint);
    scope.setTag("method", httpMethod);

    if (requestId) {
      scope.setTag("requestId", requestId);
    }

    if (plan && userId) {
      scope.setTag("plan", plan);
    }

    scope.setContext("request_details", {
      method: httpMethod,
      endpoint,
      path: req.path,
      ...(requestId ? { requestId } : {}),
    });

    eventId = Sentry.captureException(err);
  });

  return eventId;
}

export async function trackSpan<T>(
  options: { name: string; op?: string },
  fn: () => Promise<T> | T,
): Promise<T> {
  return Sentry.startSpan(options, fn);
}
