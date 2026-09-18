import { Router } from "express";
import { submitFeedbackController } from "../../controllers/feedback/feedback.controller.ts";

const router: Router = Router();

router.post("/", submitFeedbackController);

export default router;
