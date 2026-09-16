import { Router } from "express";
import {
  createSocialController,
  getSocialsController,
  updateSocialController,
  deleteSocialController,
  reorderSocialsController,
} from "../../controllers/social/social.controller.ts";
import { protectedRoute } from "../../middlewares/protected-routes.middleware.ts";

const router: Router = Router();

router.use(protectedRoute);

router.post("/", createSocialController);
router.get("/", getSocialsController);
router.post("/reorder", reorderSocialsController);
router.patch("/:id", updateSocialController);
router.delete("/:id", deleteSocialController);

export default router;
