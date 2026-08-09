import type { Request, Response } from "express";

import { getFailedJobs } from "../../services/admin.service.ts";
import { ApiResponse } from "../../utils/api-response.ts";

export const failedJobsController = async (req: Request, res: Response) => {
  const jobs = await getFailedJobs();

  const response = ApiResponse(jobs, "Failed jobs retrieved successfully", 200);

  return res.status(response.statusCode).json(response);
};
