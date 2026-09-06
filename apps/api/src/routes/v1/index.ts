// src/routes/v1/index.ts
import { Router } from "express";
import userRoutes from "./user.routes.ts";
import uploadRoutes from "./upload.routes.ts";
import linkRoutes from "./link.routes.ts";
import redirectRoutes from "./click-event.routes.ts";
import analyticsRoutes from "./analytics.routes.ts";
import adminRoutes from "./admin.routes.ts";
import liveRoutes from "./live.routes.ts";
import billingRoutes from "./billing.routes.ts";
import emailRoutes from "./email.routes.ts";
import authRoutes from "./auth.routes.ts";

const router: Router = Router();

router.use("/users", userRoutes);
router.use("/uploads", uploadRoutes);
router.use("/links", linkRoutes);
router.use("/redirect", redirectRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/admin", adminRoutes);
router.use("/live", liveRoutes);
router.use("/billing", billingRoutes);
router.use("/email", emailRoutes);
router.use("/auth", authRoutes);

export default router;
