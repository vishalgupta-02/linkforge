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
  createSectionController,
  deleteSectionController,
  getSectionsController,
  reorderSectionsController,
  updateSectionController,
} from "../../controllers/link/link.controller.ts";

const router: Router = Router();

// Links
router.post("/create", protectedRoute, createLinkController);
router.get("/get-links", protectedRoute, getLinksController);
router.patch("/update/:id", protectedRoute, updateLinkController);
router.delete("/delete/:id", protectedRoute, deleteLinkController);
router.patch("/reorder", protectedRoute, reorderLinksController);
router.patch("/:id/toggle", protectedRoute, toggleLinkController);
router.get("/profile/:username/links", getPublicLinksController);
router.get("/stats", protectedRoute, getLinkStatsController);
router.get("/deleted", protectedRoute, getDeletedLinksController);
router.patch("/:id/restore", protectedRoute, restoreLink);

// Link Sections
router.get("/sections", protectedRoute, getSectionsController);
router.post("/sections", protectedRoute, createSectionController);
router.patch("/sections/reorder", protectedRoute, reorderSectionsController);
router.patch("/sections/:id", protectedRoute, updateSectionController);
router.delete("/sections/:id", protectedRoute, deleteSectionController);

export default router;
