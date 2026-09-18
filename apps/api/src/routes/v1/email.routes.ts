import { Router } from "express";
import { sendTestEmailController } from "../../controllers/email/email.controller.ts";

const router: Router = Router();

router.post("/test", sendTestEmailController);

export default router;
