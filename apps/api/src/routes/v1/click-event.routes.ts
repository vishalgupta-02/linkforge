// routes/redirect.routes.ts
import { Router } from "express";
import { redirectController } from "../../controllers/click-event/click-event.controller.ts";

const router: Router = Router();

router.get("/:linkId", redirectController);

export default router;
