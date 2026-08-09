import type { Request, Response } from "express";
import {
  createLink,
  deleteLink,
  getLinks,
  getLinkStats,
  getPublicLinks,
  reorderLinks,
  updateLink,
} from "../../services/link.service.ts";
import { AppError } from "../../utils/api-error.ts";
import { ApiResponse } from "../../utils/api-response.ts";
import {
  createLinkSchema,
  reorderLinksSchema,
  updateLinkSchema,
} from "../../validators/link.validator.ts";
import { prisma } from "../../db/client.ts";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export const createLinkController = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) throw new AppError("Unauthorized", 401);

  const parsed = createLinkSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400);
  }

  const link = await createLink(userId, parsed.data);

  return res.status(201).json(ApiResponse(link, "Link created"));
};

export const getLinksController = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) throw new AppError("Unauthorized", 401);

  const links = await getLinks(userId);

  return res.json(ApiResponse(links, "Links fetched", 200));
};

export const updateLinkController = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) throw new AppError("Unauthorized", 401);

  const parsed = updateLinkSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400);
  }

  const result = await updateLink(userId, id, parsed.data);

  if (result.count === 0) {
    throw new AppError("Link not found", 404);
  }

  return res.json(ApiResponse(null, "Link updated", 200));
};

export const deleteLinkController = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) throw new AppError("Unauthorized", 401);

  const result = await deleteLink(userId, id);

  if (result.count === 0) {
    throw new AppError("Link not found", 404);
  }

  return res.json(ApiResponse(null, "Link deleted", 200));
};

export const reorderLinksController = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) throw new AppError("Unauthorized", 401);

  const parsed = reorderLinksSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400);
  }

  await reorderLinks(userId, parsed.data.linkIds);

  return res.json(ApiResponse(null, "Links reordered", 200));
};

export const toggleLinkController = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) throw new AppError("Unauthorized", 401);

  const result = await reorderLinks(userId, id);

  return res.json(ApiResponse(result, "Link visibility updated", 200));
};

export const getPublicLinksController = async (req: Request, res: Response) => {
  const username = req.params.username;

  if (!username || Array.isArray(username)) {
    throw new AppError("Username is required", 400);
  }

  const links = await getPublicLinks(username);

  return res.json(ApiResponse(links, "Public links fetched successfully", 200));
};

export const getLinkStatsController = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const stats = await getLinkStats(userId);

  return res.json(ApiResponse(stats, "Link stats fetched successfully", 200));
};

export const getDeletedLinksController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.user?.id;

  if (!userId) throw new AppError("Unauthorized", 401);

  const links = await prisma.link.findMany({
    where: {
      userId,
      deletedAt: { not: null },
    },
    orderBy: {
      deletedAt: "desc",
    },
  });

  // add daysLeft (UX)
  const enriched = links.map((link) => {
    const diff = Date.now() - (link.deletedAt?.getTime() ?? 0);
    const daysPassed = Math.floor(diff / (1000 * 60 * 60 * 24));

    return {
      ...link,
      daysLeft: Math.max(30 - daysPassed, 0),
    };
  });

  res.json(ApiResponse(enriched, "Deleted links fetched successfully", 200));
};

export const restoreLink = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const link = await prisma.link.findFirst({
    where: { id, userId },
  });

  if (!link || !link.deletedAt) {
    return res.json(ApiResponse(null, "Link not found", 404));
  }

  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  if (Date.now() - link.deletedAt.getTime() > THIRTY_DAYS) {
    return res.json(ApiResponse(null, "Restore period expired", 400));
  }

  const restored = await prisma.link.update({
    where: { id },
    data: {
      deletedAt: null,
      isActive: true,
    },
  });

  res.json(ApiResponse(restored, "Link restored successfully", 200));
};

export const deleteLinkPermanently = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) throw new AppError("Unauthorized", 401);

  await prisma.link.delete({
    where: { id },
  });

  res.json(ApiResponse(null, "Link permanently deleted", 200));
};
