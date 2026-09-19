import type { Request, Response } from "express";
import type { FeedbackEmailJobData } from "@vyrex/types";
import { feedbackSchema } from "../../validators/feedback.validator.ts";
import { enqueueFeedbackEmail } from "../../queues/email.queue.ts";
import { ApiResponse } from "../../utils/api-response.ts";
import { AppError } from "../../utils/api-error.ts";
import { logger } from "../../lib/logger.ts";

export const submitFeedbackController = async (req: Request, res: Response) => {
  const parsed = feedbackSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(
      parsed.error.issues[0]?.message || "Invalid feedback payload",
      400,
      "VALIDATION_ERROR",
      parsed.error,
    );
  }

  const { name, email, category, rating, message } = parsed.data;
  const userId = req.user?.id;
  const resolvedFromEmail = email || req.user?.email || "anonymous@linkforge.app";

  logger.info("Enqueuing user feedback job", {
    event: "feedback.submitted",
    fromEmail: resolvedFromEmail,
    category,
    rating,
    userId: userId ?? null,
    targetEmail: "abhimanyug987@gmail.com",
  });

  const feedbackData: FeedbackEmailJobData = {
    targetEmail: "abhimanyug987@gmail.com",
    fromEmail: resolvedFromEmail,
    category,
    rating: rating ?? 5,
    message,
  };

  const resolvedName = name || (req.user as { name?: string } | undefined)?.name;
  if (resolvedName) {
    feedbackData.name = resolvedName;
  }
  if (userId) {
    feedbackData.userId = userId;
  }

  const job = await enqueueFeedbackEmail(feedbackData);

  return res.status(200).json(
    ApiResponse(
      { jobId: job.id },
      "Thank you for your feedback! It has been submitted successfully.",
      200,
    ),
  );
};
