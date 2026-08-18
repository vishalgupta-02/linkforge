import type { Request, Response } from "express";

import { prisma } from "../../db/client.ts";
import {
  createLiveVisitor,
  refreshLiveVisitor,
  removeLiveVisitor,
  getLiveVisitorCount,
} from "../../services/live.service.ts";
import { AppError } from "../../utils/api-error.ts";
import { normalizeUsername } from "../../utils/username.ts";
import { isProPlan } from "../../utils/plan.ts";

export const joinLiveVisitors = async (
  request: Request,
  response: Response,
) => {
  const { username } = request.params;
  const { sessionId } = request.body;

  if (!username) {
    throw new AppError("Username is required", 400);
  }

  if (!sessionId) {
    throw new AppError("Session ID is required", 400);
  }

  const normalized = normalizeUsername(username);

  const user = await prisma.user.findUnique({
    where: {
      userName_lower: normalized,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await createLiveVisitor(user.id, sessionId);

  const visitors = await getLiveVisitorCount(user.id);

  return response.status(200).json({
    success: true,
    data: {
      visitors,
    },
  });
};

export const heartbeatLiveVisitor = async (
  request: Request,
  response: Response,
) => {
  const { username } = request.params;
  const { sessionId } = request.body;

  if (!username) {
    throw new AppError("Username is required", 400);
  }

  if (!sessionId) {
    throw new AppError("Session ID is required", 400);
  }

  const normalized = normalizeUsername(username);

  const user = await prisma.user.findUnique({
    where: {
      userName_lower: normalized,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await refreshLiveVisitor(user.id, sessionId);

  return response.status(204).send();
};

export const leaveLiveVisitor = async (
  request: Request,
  response: Response,
) => {
  const { username } = request.params;
  const { sessionId } = request.body;

  if (!username) {
    throw new AppError("Username is required", 400);
  }

  if (!sessionId) {
    throw new AppError("Session ID is required", 400);
  }

  const normalized = normalizeUsername(username);

  const user = await prisma.user.findUnique({
    where: {
      userName_lower: normalized,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await removeLiveVisitor(user.id, sessionId);

  return response.status(204).send();
};

export const liveVisitorsStream = async (
  request: Request,
  response: Response,
) => {
  const { username } = request.params;
  const authenticatedUserId = request.user?.id;

  if (!authenticatedUserId) {
    throw new AppError("Unauthorized", 401);
  }

  if (!username) {
    throw new AppError("Username is required", 400);
  }

  const normalized = normalizeUsername(username);

  const user = await prisma.user.findUnique({
    where: {
      userName_lower: normalized,
    },
    select: {
      id: true,
      plan: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Verify ownership
  if (user.id !== authenticatedUserId) {
    throw new AppError("Forbidden: You do not own this profile", 403);
  }

  // Verify Pro plan access
  if (!isProPlan(user.plan)) {
    throw new AppError("Live visitors is available on the Pro plan.", 403);
  }

  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache, no-transform");
  response.setHeader("Connection", "keep-alive");
  response.setHeader("X-Accel-Buffering", "no");

  if (typeof response.flushHeaders === "function") {
    response.flushHeaders();
  }

  let lastCount = -1;

  const sendCount = async () => {
    const count = await getLiveVisitorCount(user.id);

    if (count === lastCount) {
      return;
    }

    lastCount = count;

    response.write(`event: visitors\n`);
    response.write(
      `data: ${JSON.stringify({
        visitors: count,
      })}\n\n`,
    );
  };

  await sendCount();

  const interval = setInterval(async () => {
    try {
      await sendCount();
    } catch (error) {
      console.error("Live visitor SSE error:", error);
    }
  }, 5_000);

  const keepAlive = setInterval(() => {
    try {
      response.write(`: heartbeat\n\n`);
    } catch (error) {
      console.error("Live visitor SSE keepalive error:", error);
    }
  }, 20_000);

  request.on("close", () => {
    clearInterval(interval);
    clearInterval(keepAlive);
    response.end();
  });
};
