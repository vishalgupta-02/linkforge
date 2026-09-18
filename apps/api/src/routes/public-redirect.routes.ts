import { Router } from "express";
import { publicRedirectController } from "../controllers/redirect/public-redirect.controller.ts";

const router: Router = Router();

router.get("/:publicId", publicRedirectController);

export default router;
