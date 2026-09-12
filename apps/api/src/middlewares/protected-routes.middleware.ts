import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import * as Sentry from "@sentry/node";
import { auth } from "../lib/auth.ts";
import { AppError } from "../utils/api-error.ts";
import { formatPlan } from "../utils/sentry-context.ts";

export const protectedRoute = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session?.user) {
    throw new AppError("Unauthorized", 401);
  }

  const plan = formatPlan((session.user as any)?.plan || "FREE");

  request.user = {
    id: session.user.id,
    email: session.user.email,
    plan,
    userName: (session.user as any)?.userName || (session.user as any)?.username || null,
  };

  // 🛡️ Attach request-isolated user context to Sentry
  try {
    Sentry.setUser({
      id: session.user.id,
    });
    Sentry.setTag("plan", plan);
  } catch {
    // Sentry context enrichment must never fail request processing
  }

  next();
};

