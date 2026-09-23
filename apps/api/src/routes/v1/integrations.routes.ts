import { Router } from "express";
import {
  getApiKeys,
  createApiKey,
  revokeApiKey,
  getWebhooks,
  createWebhook,
  deleteWebhook,
  testPingWebhook,
} from "../../controllers/integrations/integrations.controller.ts";

const router: Router = Router();

// API Keys
router.get("/keys", getApiKeys);
router.post("/keys", createApiKey);
router.delete("/keys/:id", revokeApiKey);

// Webhooks
router.get("/webhooks", getWebhooks);
router.post("/webhooks", createWebhook);
router.delete("/webhooks/:id", deleteWebhook);
router.post("/webhooks/test-ping", testPingWebhook);

export default router;
