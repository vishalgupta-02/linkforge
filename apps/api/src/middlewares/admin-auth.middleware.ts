import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.ts";
import { AppError } from "../utils/api-error.ts";

function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export const adminAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {

    const authHeader = req.headers.authorization;
    const adminSecret = process.env.ADMIN_SECRET_KEY;

    if (adminSecret && authHeader) {
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : authHeader.trim();

      if (safeCompare(token, adminSecret)) {
        return next();
      }
    }

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (
      session?.user?.email &&
      adminEmails.includes(session.user.email.toLowerCase())
    ) {
      req.user = {
        id: session.user.id,
        email: session.user.email,
        plan: (session.user as any)?.plan || "PRO",
        userName: (session.user as any)?.userName || null,
      };
      return next();
    }

    throw new AppError("Forbidden: Administrator access required", 403);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError("Forbidden: Administrator access required", 403));
  }
};
