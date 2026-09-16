import { z } from "zod";
import { isSafeDestinationUrl } from "./link.validator.ts";

const safeUrlSchema = z.string().min(1).refine(
  (val) => {
    // Allow standard URL or auto-prefix if needed
    const formatted = val.startsWith("http://") || val.startsWith("https://") || val.startsWith("mailto:")
      ? val
      : `https://${val}`;
    if (formatted.startsWith("mailto:")) return true;
    return isSafeDestinationUrl(formatted);
  },
  { message: "URL must be a valid destination web address" },
);

export const createSocialLinkSchema = z.object({
  platform: z.string().min(1).max(50),
  url: safeUrlSchema,
  position: z.number().int().nonnegative().optional(),
  isActive: z.boolean().default(true).optional(),
});

export const updateSocialLinkSchema = z.object({
  platform: z.string().min(1).max(50).optional(),
  url: safeUrlSchema.optional(),
  position: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export const reorderSocialLinksSchema = z.object({
  socialIds: z.array(z.string().uuid()).min(1),
});
