import type { Request, Response } from "express";

import { getDashboardAnalytics } from "../../services/analytics.service.ts";
import { ApiResponse } from "../../utils/api-response.ts";

// export const dashboardAnalyticsController = async (
//   req: Request,
//   res: Response,
// ) => {
//   const userId = req?.user.id;

//   const analytics = await getDashboardAnalytics(userId);

//   return res.status(200).json({
//     success: true,
//     data: analytics,
//   });
// };

export const dashboardAnalyticsController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.user?.id;

  const plan = ((req.user as any)?.plan || "FREE") as "FREE" | "PRO";

  const range = (req.query.range as string) || undefined;

  if (!userId) {
    const response = ApiResponse(null, "Unauthorized: User ID missing", 401);
    return res.status(response.statusCode).json(response);
  }

  const analytics = await getDashboardAnalytics(userId, plan, range);

  const response = ApiResponse(
    analytics,
    "Dashboard analytics retrieved successfully",
    200,
  );

  return res.status(response.statusCode).json(response);
};

