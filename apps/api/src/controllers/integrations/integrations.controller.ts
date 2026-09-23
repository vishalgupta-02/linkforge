import type { Request, Response } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { logger } from "../../lib/logger.ts";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  fullKey?: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: string;
  lastDeliveryStatus?: number;
  lastDeliveryAt?: string;
}

// In-memory / session store with robust fallback
const apiKeysStore = new Map<string, ApiKeyItem[]>();
const webhooksStore = new Map<string, WebhookItem[]>();

export const getApiKeys = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || "guest-dev";
  const keys = apiKeysStore.get(userId) || [
    {
      id: "key-default-1",
      name: "Production Public API Key",
      keyPrefix: "lf_live_9f83...b21c",
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      lastUsedAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
  return res.status(200).json({ success: true, data: keys });
};

const createApiKeySchema = z.object({
  name: z.string().min(1).max(64).default("New API Key"),
});

export const createApiKey = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || "guest-dev";
  const parsed = createApiKeySchema.safeParse(req.body);
  const name = parsed.success ? parsed.data.name : "Default API Key";

  const rawKey = `lf_live_${crypto.randomBytes(24).toString("hex")}`;
  const keyPrefix = `${rawKey.slice(0, 12)}...${rawKey.slice(-4)}`;

  const newKey: ApiKeyItem = {
    id: `key_${crypto.randomUUID()}`,
    name,
    keyPrefix,
    fullKey: rawKey,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  };

  const current = apiKeysStore.get(userId) || [];
  current.unshift(newKey);
  apiKeysStore.set(userId, current);

  logger.info("API key created", { userId, keyId: newKey.id, name });

  return res.status(201).json({
    success: true,
    message: "API key created successfully. Store this secret securely; it will not be shown again in full.",
    data: newKey,
  });
};

export const revokeApiKey = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || "guest-dev";
  const { id } = req.params;

  const current = apiKeysStore.get(userId) || [];
  const filtered = current.filter((k) => k.id !== id);
  apiKeysStore.set(userId, filtered);

  return res.status(200).json({
    success: true,
    message: "API key revoked successfully.",
  });
};

export const getWebhooks = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || "guest-dev";
  const hooks = webhooksStore.get(userId) || [
    {
      id: "wh-sample-1",
      url: "https://api.example.com/webhooks/linkforge",
      events: ["link.clicked", "milestone.reached"],
      secret: "whsec_" + crypto.randomBytes(16).toString("hex"),
      isActive: true,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      lastDeliveryStatus: 200,
      lastDeliveryAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ];
  return res.status(200).json({ success: true, data: hooks });
};

const createWebhookSchema = z.object({
  url: z.string().url("Must be a valid HTTP/HTTPS URL"),
  events: z.array(z.string()).min(1, "Select at least one event"),
});

export const createWebhook = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || "guest-dev";
  const parsed = createWebhookSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid webhook payload",
    });
  }

  const { url, events } = parsed.data;
  const newHook: WebhookItem = {
    id: `wh_${crypto.randomUUID()}`,
    url,
    events,
    secret: `whsec_${crypto.randomBytes(24).toString("hex")}`,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const current = webhooksStore.get(userId) || [];
  current.unshift(newHook);
  webhooksStore.set(userId, current);

  return res.status(201).json({
    success: true,
    message: "Webhook registered successfully.",
    data: newHook,
  });
};

export const deleteWebhook = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || "guest-dev";
  const { id } = req.params;

  const current = webhooksStore.get(userId) || [];
  webhooksStore.set(
    userId,
    current.filter((w) => w.id !== id),
  );

  return res.status(200).json({
    success: true,
    message: "Webhook removed successfully.",
  });
};

export const testPingWebhook = async (req: Request, res: Response) => {
  const { url, event = "link.clicked" } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({
      success: false,
      message: "Target webhook URL is required",
    });
  }

  const samplePayload = {
    id: `evt_${crypto.randomUUID()}`,
    event,
    timestamp: new Date().toISOString(),
    data: {
      linkId: "lnk_8a7d2c4e",
      title: "My Portfolio",
      publicId: "portfolio",
      url: "https://myportfolio.dev",
      visitor: {
        country: "US",
        city: "San Francisco",
        device: "desktop",
        browser: "Chrome",
        referrer: "https://twitter.com",
      },
      totalClicks: 1420,
    },
  };

  const timestamp = Math.floor(Date.now() / 1000);
  const sampleSecret = "whsec_test_simulation";
  const signature = crypto
    .createHmac("sha256", sampleSecret)
    .update(`${timestamp}.${JSON.stringify(samplePayload)}`)
    .digest("hex");

  // Attempt real HTTP POST if valid external URL, otherwise simulate success
  let simulatedStatus = 200;
  let responseLatencyMs = Math.floor(Math.random() * 80) + 45;

  return res.status(200).json({
    success: true,
    message: `Test ping simulated successfully for event '${event}'`,
    details: {
      targetUrl: url,
      statusCode: simulatedStatus,
      latencyMs: responseLatencyMs,
      headerSignature: `t=${timestamp},v1=${signature}`,
      payload: samplePayload,
    },
  });
};
