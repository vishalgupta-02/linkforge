
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(160).optional(),
  userName: z.string().optional(),
  image: z.string().url().optional(),
});
