import { Router } from "express";
import { failedJobsController } from "../../controllers/admin/admin.controller.ts";
import { protectedRoute } from "../../middlewares/protected-routes.middleware.ts";
import { adminAuthMiddleware } from "../../middlewares/admin-auth.middleware.ts";

const router: Router = Router();

router.get(
  "/failed-jobs",
  protectedRoute,
  adminAuthMiddleware,
  failedJobsController,
);

export default router;

