import { Router } from "express";
import { uploadController } from "../../controllers/upload/upload.controller.ts";
import { upload } from "../../middlewares/upload.middleware.ts";
import { protectedRoute } from "../../middlewares/protected-routes.middleware.ts";

const router: Router = Router();

router.post("/", protectedRoute, upload.single("avatar"), uploadController);

export default router;
