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

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookController,
);

router.post("/checkout", protectedRoute, createCheckoutSessionController);
router.get("/portal", protectedRoute, createCustomerPortalSessionController);
router.get("/status", protectedRoute, getBillingStatusController);

export default router;
