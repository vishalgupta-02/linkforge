import { Router } from "express";
import { protectedRoute } from "../../middlewares/protected-routes.middleware.ts";
import {
  createLinkController,
  deleteLinkController,
  getDeletedLinksController,
  getLinksController,
  getLinkStatsController,
  getPublicLinksController,
  reorderLinksController,
  restoreLink,
  toggleLinkController,
  updateLinkController,
} from "../../controllers/link/link.controller.ts";

const router: Router = Router();

router.post("/create", protectedRoute, createLinkController);
router.get("/get-links", protectedRoute, getLinksController);
router.patch("/update/:id", protectedRoute, updateLinkController);
router.delete("/delete/:id", protectedRoute, deleteLinkController);
router.patch("/reorder", protectedRoute, reorderLinksController);
router.patch("/:id/toggle", protectedRoute, toggleLinkController);
router.get("/profile/:username/links", getPublicLinksController);
router.get("/stats", protectedRoute, getLinkStatsController);
router.get("/deleted", getDeletedLinksController);
router.patch("/:id/restore", restoreLink);

export default router;
