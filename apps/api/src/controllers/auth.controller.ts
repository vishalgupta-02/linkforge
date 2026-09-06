import type { Request, Response } from "express";
import {
  forgotPasswordSchema,
  verifyResetTokenSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.ts";
import {
  requestPasswordReset,
  verifyPasswordResetToken,
  resetPasswordWithToken,
} from "../services/auth-reset.service.ts";
import { ApiResponse } from "../utils/api-response.ts";
import { AppError } from "../utils/api-error.ts";

/**
 * Handles password reset request (Forgot Password).
 * Returns generic success response to prevent email enumeration.
 */
export const forgotPasswordController = async (req: Request, res: Response) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error);
  }

  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  const result = await requestPasswordReset(parsed.data.email, String(ip));

  return res.json(ApiResponse(null, result.message, 200));
};

/**
 * Handles verification of a reset token before allowing user to change password.
 */
export const verifyResetTokenController = async (
  req: Request,
  res: Response,
) => {
  const parsed = verifyResetTokenSchema.safeParse(req.query);

  if (!parsed.success) {
    throw new AppError(
      "This password reset link is invalid or has expired.",
      400,
      "INVALID_OR_EXPIRED_TOKEN",
      parsed.error,
    );
  }

  const result = await verifyPasswordResetToken(parsed.data.token);

  return res.json(ApiResponse(result, "Reset token is valid", 200));
};

/**
 * Handles the actual password reset using a valid token and new password.
 */
export const resetPasswordController = async (req: Request, res: Response) => {
  const parsed = resetPasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error);
  }

  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  const result = await resetPasswordWithToken(
    parsed.data.token,
    parsed.data.password,
    String(ip),
  );

  return res.json(ApiResponse(null, result.message, 200));
};
