import { Router } from "express";

import { failedJobsController } from "../../controllers/admin/admin.controller.ts";

const router: Router = Router();

router.get("/failed-jobs", failedJobsController);

export default router;
