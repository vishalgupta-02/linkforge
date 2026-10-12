import type { Request, Response } from "express";
import { exportClickLogs, exportLinksData } from "../../services/export.service.ts";
import { AppError } from "../../utils/api-error.ts";

export const exportAnalyticsController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("Unauthorized: User not authenticated", 401);
  }

  const format = (req.query.format === "json" ? "json" : "csv") as
    | "csv"
    | "json";
  const type = (req.query.type === "links" ? "links" : "clicks") as
    | "clicks"
    | "links";

  const result =
    type === "links"
      ? await exportLinksData(userId, format)
      : await exportClickLogs(userId, format);

  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
  return res.status(200).send(result.content);
};
