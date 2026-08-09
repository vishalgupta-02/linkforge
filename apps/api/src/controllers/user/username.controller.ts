import type { Request, Response } from "express";
import { changeUsername } from "../../services/username.service.ts";
import { AppError } from "../../utils/api-error.ts";
import { ApiResponse } from "../../utils/api-response.ts";
import { changeUsernameSchema } from "../../validators/username.validator.ts";

export const changeUsernameController = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const parsed = changeUsernameSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400);
  }

  const result = await changeUsername(userId, parsed.data.username);

  return res.status(200).json(ApiResponse(result, "Username updated"));
};

// const getUsernameController = () => {
//   const userId;
// };
