import { Router } from "express";
import { protectedRoute } from "../../middlewares/protected-routes.middleware.ts";
import { requirePro } from "../../middlewares/plan-guard.middleware.ts";
import {
  addDomainController,
  deleteDomainController,
  getDomainsController,
  resolveDomainController,
  verifyDomainController,
} from "../../controllers/domain/domain.controller.ts";

const router: Router = Router();

// Public endpoint for Next.js middleware hostname rewrite
router.get("/resolve/:hostname", resolveDomainController);

// Pro-gated domain management routes
router.get("/", protectedRoute, requirePro, getDomainsController);
router.post("/", protectedRoute, requirePro, addDomainController);
router.post("/:id/verify", protectedRoute, requirePro, verifyDomainController);
router.delete("/:id", protectedRoute, requirePro, deleteDomainController);

export default router;
