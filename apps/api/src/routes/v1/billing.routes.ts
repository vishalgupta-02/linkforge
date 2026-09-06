import { Router } from "express";
import express from "express";
import { protectedRoute } from "../../middlewares/protected-routes.middleware.ts";
import {
  createCheckoutSessionController,
  createCustomerPortalSessionController,
  getBillingStatusController,
  stripeWebhookController,
} from "../../controllers/billing/billing.controller.ts";

const router: Router = Router();

// Webhook endpoint: Stripe webhook handler (no Better Auth session)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookController,
);

// Protected endpoints
router.post("/checkout", protectedRoute, createCheckoutSessionController);
router.get("/portal", protectedRoute, createCustomerPortalSessionController);
router.get("/status", protectedRoute, getBillingStatusController);

export default router;


