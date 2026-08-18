import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.ts";
import { AppError } from "../utils/api-error.ts";

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

  request.user = {
    id: session.user.id,
    email: session.user.email,
    plan: (session.user as any)?.plan || "FREE",
  };

  next();
};

