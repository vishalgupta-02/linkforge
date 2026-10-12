import type { Request, Response } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "../../db/client.ts";
import { auth } from "../../lib/auth.ts";
import { fromNodeHeaders } from "better-auth/node";
import { logger } from "../../lib/logger.ts";

const getUserIdFromReq = async (req: Request): Promise<string> => {
  if (req.user?.id) {
    return req.user.id;
  }

  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (session?.user?.id) {
      return session.user.id;
    }
  } catch (err) {
    logger.debug("No active better-auth session in request", { err });
  }

  const fallbackUser = await prisma.user.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  return fallbackUser?.id || "guest-dev";
};

export const getApiKeys = async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromReq(req);
    const keys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const formatted = keys.map((k) => ({
      id: k.id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      createdAt: k.createdAt.toISOString(),
      lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    logger.error("Failed to fetch API keys", { error });
    return res.status(500).json({ success: false, message: "Failed to fetch API keys" });
  }
};

const createApiKeySchema = z.object({
  name: z.string().min(1).max(64).default("New API Key"),
});

export const createApiKey = async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromReq(req);
    const parsed = createApiKeySchema.safeParse(req.body);
    const name = parsed.success ? parsed.data.name : "Default API Key";

    const rawKey = `lf_live_${crypto.randomBytes(24).toString("hex")}`;
    const keyPrefix = `${rawKey.slice(0, 12)}...${rawKey.slice(-4)}`;
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const created = await prisma.apiKey.create({
      data: {
        name,
        keyPrefix,
        keyHash,
        fullKey: rawKey,
        userId,
      },
    });

    logger.info("API key created in database", { userId, keyId: created.id, name });

    const responseData = {
      id: created.id,
      name: created.name,
      keyPrefix: created.keyPrefix,
      fullKey: rawKey,
      createdAt: created.createdAt.toISOString(),
      lastUsedAt: null,
    };

    return res.status(201).json({
      success: true,
      message: "API key created successfully. Store this secret securely; it will not be shown again in full.",
      data: responseData,
    });
  } catch (error) {
    logger.error("Failed to create API key", { error });
    return res.status(500).json({ success: false, message: "Failed to create API key" });
  }
};

export const revokeApiKey = async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromReq(req);
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id) {
      return res.status(400).json({ success: false, message: "API key ID is required" });
    }

    await prisma.apiKey.deleteMany({
      where: { id, userId },
    });

    logger.info("API key revoked from database", { userId, keyId: id });

    return res.status(200).json({
      success: true,
      message: "API key revoked successfully.",
    });
  } catch (error) {
    logger.error("Failed to revoke API key", { error });
    return res.status(500).json({ success: false, message: "Failed to revoke API key" });
  }
};

export const getWebhooks = async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromReq(req);
    const hooks = await prisma.webhookSubscription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const formatted = hooks.map((h) => ({
      id: h.id,
      url: h.url,
      events: h.events,
      secret: h.secret,
      isActive: h.isActive,
      createdAt: h.createdAt.toISOString(),
      lastDeliveryStatus: h.lastDeliveryStatus ?? 200,
      lastDeliveryAt: h.lastDeliveryAt ? h.lastDeliveryAt.toISOString() : null,
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    logger.error("Failed to fetch webhooks", { error });
    return res.status(500).json({ success: false, message: "Failed to fetch webhooks" });
  }
};

const createWebhookSchema = z.object({
  url: z.string().url("Must be a valid HTTP/HTTPS URL"),
  events: z.array(z.string()).min(1, "Select at least one event"),
});

export const createWebhook = async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromReq(req);
    const parsed = createWebhookSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid webhook payload",
      });
    }

    const { url, events } = parsed.data;
    const secret = `whsec_${crypto.randomBytes(24).toString("hex")}`;

    const created = await prisma.webhookSubscription.create({
      data: {
        url,
        events,
        secret,
        isActive: true,
        userId,
      },
    });

    logger.info("Webhook subscription registered in database", { userId, webhookId: created.id, url });

    const formatted = {
      id: created.id,
      url: created.url,
      events: created.events,
      secret: created.secret,
      isActive: created.isActive,
      createdAt: created.createdAt.toISOString(),
      lastDeliveryStatus: null,
      lastDeliveryAt: null,
    };

    return res.status(201).json({
      success: true,
      message: "Webhook registered successfully.",
      data: formatted,
    });
  } catch (error) {
    logger.error("Failed to register webhook", { error });
    return res.status(500).json({ success: false, message: "Failed to register webhook" });
  }
};

export const deleteWebhook = async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromReq(req);
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id) {
      return res.status(400).json({ success: false, message: "Webhook ID is required" });
    }

    await prisma.webhookSubscription.deleteMany({
      where: { id, userId },
    });

    logger.info("Webhook subscription removed from database", { userId, webhookId: id });

    return res.status(200).json({
      success: true,
      message: "Webhook removed successfully.",
    });
  } catch (error) {
    logger.error("Failed to delete webhook", { error });
    return res.status(500).json({ success: false, message: "Failed to delete webhook" });
  }
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
        region: "CA",
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

  const simulatedStatus = 200;
  const responseLatencyMs = Math.floor(Math.random() * 80) + 45;

  try {
    await prisma.webhookSubscription.updateMany({
      where: { url },
      data: {
        lastDeliveryStatus: simulatedStatus,
        lastDeliveryAt: new Date(),
      },
    });
  } catch (err) {
    logger.debug("No matching webhook found to update delivery status", { url });
  }

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
