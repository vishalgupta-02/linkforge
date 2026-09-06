import { Router } from "express";
import { sendTestEmailController } from "../../controllers/email/email.controller.ts";

const router: Router = Router();

/**
 * @route POST /api/v1/email/test
 * @description Send a test email through Resend
 */
router.post("/test", sendTestEmailController);

export default router;
