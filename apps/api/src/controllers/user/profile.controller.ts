import type { Request, Response } from "express";
import {
  getPublicProfile,
  getPublicProfileByUserId,
  updateProfile,
} from "../../services/profile.service.ts";
import { ApiResponse } from "../../utils/api-response.ts";
import { AppError } from "../../utils/api-error.ts";
import { updateProfileSchema } from "../../validators/profile.validator.ts";

// export const publicProfile = async (request: Request, response: Response) => {
//   const username = request.params.username as string;

//   if (!username) {
//     throw new AppError("Username is required", 400);
//   }

//   const profile = await getPublicProfile(username);

//   if (!profile) {
//     throw new AppError("User not found", 404);
//   }

//   return response.json(
//     ApiResponse(profile, "Public profile fetched successfully", 200),
//   );
// };

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
  // console.log("body:", req.body, "parsed:", parsed);

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
  // const userId = req.user?.id;

  const { userId } = req.body;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const profile = await getPublicProfileByUserId(userId);

  if (!profile) {
    return res.json(ApiResponse(null, "User not found", 404));
  }

  const response = ApiResponse(profile, "Username fetched successfully", 200);

  return res.json(response);
};
