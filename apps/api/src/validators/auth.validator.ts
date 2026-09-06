import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
    .max(255, "Email is too long"),
});

export const verifyResetTokenSchema = z.object({
  token: z
    .string({
      required_error: "Reset token is required",
      invalid_type_error: "Token must be a string",
    })
    .trim()
    .min(1, "Reset token cannot be empty"),
});

export const resetPasswordSchema = z
  .object({
    token: z
      .string({
        required_error: "Reset token is required",
        invalid_type_error: "Token must be a string",
      })
      .trim()
      .min(1, "Reset token is required"),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password is too long"),
    confirmPassword: z
      .string({
        required_error: "Please confirm your password",
      })
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyResetTokenInput = z.infer<typeof verifyResetTokenSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
