// routes/v1/user.routes.ts

import { Router } from "express";
import {
  getUsernameController,
  profileUpdateController,
  publicProfileController,
} from "../../controllers/user/profile.controller.ts";
import { protectedRoute } from "../../middlewares/protected-routes.middleware.ts";
import { changeUsernameController } from "../../controllers/user/username.controller.ts";

const router: Router = Router();

router.get("/public/:username", publicProfileController);
router.post("/user/me", getUsernameController);
router.patch("/profile", protectedRoute, profileUpdateController);
router.patch("/profile/username", protectedRoute, changeUsernameController);

export default router;
