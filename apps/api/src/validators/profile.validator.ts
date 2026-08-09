// validators/profile.validator.ts
import { z } from "zod";

export const updateProfileSchema = z.object({
  bio: z.string().max(160).optional(),
  userName: z.string().optional(),
  image: z.string().url().optional(),
});
