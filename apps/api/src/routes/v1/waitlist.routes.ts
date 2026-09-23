import { Router } from "express";
import {
  subscribeMobileWaitlist,
  getMobileWaitlistStats,
} from "../../controllers/waitlist/waitlist.controller.ts";

const router: Router = Router();

router.post("/mobile", subscribeMobileWaitlist);
router.get("/mobile/stats", getMobileWaitlistStats);

export default router;
