import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth.ts";
import { AppError } from "../utils/api-error.ts";

export const protectedRoute = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const session = await auth.api.getSession({
    headers: new Headers(Object.entries(request.headers) as [string, string][]),
  });

  if (!session?.user) {
    throw new AppError("Unauthorized", 401);
  }

  request.user = {
    id: session.user.id,
    email: session.user.email,
  };

  next();
};
