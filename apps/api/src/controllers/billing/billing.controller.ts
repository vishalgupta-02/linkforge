import {
  createProCheckoutSession,
  createCustomerPortalSession,
  getBillingStatus,
  handleStripeWebhook,
} from "../../services/billing.service.ts";
import { ApiResponse } from "../../utils/api-response.ts";
import { AppError } from "../../utils/api-error.ts";

export const createCheckoutSessionController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const data = await createProCheckoutSession(userId);

  return res
    .status(200)
    .json(ApiResponse(data, "Checkout session created successfully", 200));
};

export const createCustomerPortalSessionController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const data = await createCustomerPortalSession(userId);

  return res
    .status(200)
    .json(ApiResponse(data, "Customer portal session created successfully", 200));
};

export const getBillingStatusController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const data = await getBillingStatus(userId);

  return res
    .status(200)
    .json(ApiResponse(data, "Billing status retrieved successfully", 200));
};



export const stripeWebhookController = async (
  req: Request,
  res: Response,
) => {
  const signature = req.headers["stripe-signature"] as string | undefined;
  const rawBody = (req as any).rawBody || req.body;

  if (!rawBody) {
    throw new AppError("Missing request body for webhook", 400);
  }

  const result = await handleStripeWebhook(rawBody, signature);

  return res.status(200).json(result);
};
