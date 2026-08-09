import { z } from "zod";

export const createLinkSchema = z.object({
  url: z.string().url(),
  title: z.string().max(100).optional(),
  position: z.int(),
  public: z.boolean(),
});

export const updateLinkSchema = z.object({
  url: z.string().url().optional(),
  title: z.string().max(100).optional(),
  position: z.number().int().nonnegative().optional(),
  public: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const reorderLinksSchema = z.object({
  linkIds: z.array(z.string().uuid()).min(1),
});
