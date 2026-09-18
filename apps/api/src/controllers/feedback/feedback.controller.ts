import type { Request, Response } from "express";
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

  logger.info("Enqueuing user feedback job", {
    event: "feedback.submitted",
    fromEmail: email,
    category,
    rating,
    userId,
    targetEmail: "abhimanyug987@gmail.com",
  });

  const job = await enqueueFeedbackEmail({
    targetEmail: "abhimanyug987@gmail.com",
    fromEmail: email,
    name: name || (req.user as any)?.name || undefined,
    category,
    rating,
    message,
    userId,
  });

  return res.status(200).json(
    ApiResponse(
      { jobId: job.id },
      "Thank you for your feedback! It has been submitted successfully.",
      200,
    ),
  );
};
