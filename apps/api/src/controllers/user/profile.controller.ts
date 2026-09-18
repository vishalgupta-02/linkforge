import type { Request, Response } from "express";
import {
  getPublicProfile,
  getPublicProfileByUserId,
  updateProfile,
} from "../../services/profile.service.ts";
import { ApiResponse } from "../../utils/api-response.ts";
import { AppError } from "../../utils/api-error.ts";
import { updateProfileSchema } from "../../validators/profile.validator.ts";

export const publicProfileController = async (req: Request, res: Response) => {
  const { username } = req.params;

  const profile = await getPublicProfile(username as string);

  if (!profile) {
    return res.json(ApiResponse(null, "User not found", 404));
  }

  const response = ApiResponse(
    profile,
    "Public profile fetched successfully",
    200,
  );

  return res.json(response);
};

export const profileUpdateController = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const parsed = updateProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error);
  }

  const updatedUser = await updateProfile({
    userId,
    ...parsed.data,
  });

  const response = ApiResponse(
    updatedUser,
    "Profile updated successfully",
    200,
  );
  return res.json(response);
};

export const getUsernameController = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const profile = await getPublicProfileByUserId(userId);

  if (!profile) {
    return res.json(ApiResponse(null, "User not found", 404));
  }

  const response = ApiResponse(profile, "User profile fetched successfully", 200);

  return res.json(response);
};
