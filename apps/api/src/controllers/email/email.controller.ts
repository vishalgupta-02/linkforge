import type { Request, Response, NextFunction } from "express";
import { sendTestEmail } from "../../services/email.service.ts";
import { sendTestEmailSchema } from "../../validators/email.validator.ts";

export async function sendTestEmailController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = sendTestEmailSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid request",
        errors: result.error.flatten().fieldErrors,
      });

      return;
    }

    const email = await sendTestEmail({
      to: result.data.to,
    });

    // console.log("Email sent", email);

    res.status(200).json({
      success: true,
      message: "Test email sent successfully",
      data: {
        emailId: email.id,
      },
    });
  } catch (error) {
    next(error);
  }
}
