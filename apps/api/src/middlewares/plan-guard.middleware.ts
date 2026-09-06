import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db/client.ts";
import { AppError } from "../utils/api-error.ts";
import { isProPlan } from "../utils/plan.ts";

export const requirePlan = (requiredPlan: "PRO" | "BUSINESS" = "PRO") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    // Authoritative check: always read current plan directly from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        plan: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Attach fresh plan to request user context
    if (req.user) {
      req.user.plan = user.plan;
    }

    const authorized =
      requiredPlan === "PRO"
        ? isProPlan(user.plan)
        : user.plan.toUpperCase() === "BUSINESS";

    if (!authorized) {
      throw new AppError(
        "This feature requires a Pro plan. Please upgrade to continue.",
        403,
        "PRO_PLAN_REQUIRED",
        {
          currentPlan: user.plan,
          requiredPlan,
          upgradeUrl: "/#pricing",
        },
      );
    }

    next();
  };
};

export const requirePro = requirePlan("PRO");
