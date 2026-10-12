import { Router } from "express";

import { dashboardAnalyticsController } from "../../controllers/analytics/analytics.controller.ts";
import { exportAnalyticsController } from "../../controllers/analytics/export.controller.ts";
import { protectedRoute } from "../../middlewares/protected-routes.middleware.ts";

const router: Router = Router();

router.get("/dashboard", protectedRoute, dashboardAnalyticsController);
router.get("/export", protectedRoute, exportAnalyticsController);

export default router;
