import { Router } from "express";
import {
  forgotPasswordController,
  verifyResetTokenController,
  resetPasswordController,
} from "../../controllers/auth.controller.ts";

const router: Router = Router();

// POST /api/v1/auth/forgot-password
router.post("/forgot-password", forgotPasswordController);

// GET /api/v1/auth/reset-password/verify?token=...
router.get("/reset-password/verify", verifyResetTokenController);

// POST /api/v1/auth/reset-password
router.post("/reset-password", resetPasswordController);

export default router;
