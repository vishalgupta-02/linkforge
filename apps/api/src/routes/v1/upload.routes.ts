import { Router } from "express";
import { uploadController } from "../../controllers/upload/upload.controller.ts";
import { upload } from "../../middlewares/upload.middleware.ts";

const router: Router = Router();

router.post("/", upload.single("avatar"), uploadController);

export default router;
