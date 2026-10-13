import { Router } from "express";
import { logsAuthMiddleware } from "../../middlewares/logs-auth.middleware.ts";
import {
  authLogsController,
  getLogsController,
  getLogStatsController,
  getTraceTimelineController,
  getLogByIdController,
} from "../../controllers/admin-logs/admin-logs.controller.ts";

const router: Router = Router();

// Public auth verification for logs UI session
router.post("/auth", authLogsController);

// Protected routes (username: codemonkey + password)
router.use(logsAuthMiddleware);

router.get("/", getLogsController);
router.get("/stats", getLogStatsController);
router.get("/trace/:traceId", getTraceTimelineController);
router.get("/:id", getLogByIdController);

export default router;
