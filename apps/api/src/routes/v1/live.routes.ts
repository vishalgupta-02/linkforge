import { Router } from "express";

import {
  joinLiveVisitors,
  heartbeatLiveVisitor,
  leaveLiveVisitor,
  liveVisitorsStream,
} from "../../controllers/live/live.controller.ts";
import { validate } from "../../middlewares/validation.middleware.ts";
import { protectedRoute } from "../../middlewares/protected-routes.middleware.ts";
import {
  liveVisitorBodySchema,
  liveVisitorParamsSchema,
} from "../../validators/live.validator.ts";

const router: Router = Router();

router.post(
  "/:username/join",
  validate({
    params: liveVisitorParamsSchema,
    body: liveVisitorBodySchema,
  }),
  joinLiveVisitors,
);

router.patch(
  "/:username/heartbeat",
  validate({
    params: liveVisitorParamsSchema,
    body: liveVisitorBodySchema,
  }),
  heartbeatLiveVisitor,
);

router.delete(
  "/:username/leave",
  validate({
    params: liveVisitorParamsSchema,
    body: liveVisitorBodySchema,
  }),
  leaveLiveVisitor,
);

router.post(
  "/:username/leave",
  validate({
    params: liveVisitorParamsSchema,
    body: liveVisitorBodySchema,
  }),
  leaveLiveVisitor,
);


router.get(
  "/:username/stream",
  protectedRoute,
  validate({
    params: liveVisitorParamsSchema,
  }),
  liveVisitorsStream,
);

export default router;
