import type { Request, Response } from "express";
import {
  createSocialLink,
  getSocialLinks,
  updateSocialLink,
  deleteSocialLink,
  reorderSocialLinks,
} from "../../services/social.service.ts";
import { AppError } from "../../utils/api-error.ts";
import { ApiResponse } from "../../utils/api-response.ts";
import {
  createSocialLinkSchema,
  updateSocialLinkSchema,
  reorderSocialLinksSchema,
} from "../../validators/social.validator.ts";

export const createSocialController = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) throw new AppError("Unauthorized", 401);

  const parsed = createSocialLinkSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error);
  }

  const social = await createSocialLink(userId, parsed.data);

  return res.status(201).json(ApiResponse(social, "Social link created successfully", 201));
};

export const getSocialsController = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) throw new AppError("Unauthorized", 401);

  const socials = await getSocialLinks(userId);

  return res.json(ApiResponse(socials, "Social links fetched successfully", 200));
};

export const updateSocialController = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const id = req.params.id as string;

  if (!userId) throw new AppError("Unauthorized", 401);
  if (!id) throw new AppError("Social link ID is required", 400);

  const parsed = updateSocialLinkSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error);
  }

  const updated = await updateSocialLink(userId, id, parsed.data);

  return res.json(ApiResponse(updated, "Social link updated successfully", 200));
};

export const deleteSocialController = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const id = req.params.id as string;

  if (!userId) throw new AppError("Unauthorized", 401);
  if (!id) throw new AppError("Social link ID is required", 400);

  const deleted = await deleteSocialLink(userId, id);

  return res.json(ApiResponse(deleted, "Social link deleted successfully", 200));
};

export const reorderSocialsController = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) throw new AppError("Unauthorized", 401);

  const parsed = reorderSocialLinksSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error);
  }

  await reorderSocialLinks(userId, parsed.data.socialIds);

  return res.json(ApiResponse(null, "Social links reordered successfully", 200));
};
