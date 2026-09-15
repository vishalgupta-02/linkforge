import { z } from "zod";

export const isSafeDestinationUrl = (val: string): boolean => {
  try {
    const parsed = new URL(val);
    // Explicitly reject executable or non-web protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    // Disallow javascript: data: vbscript: etc
    const lower = val.toLowerCase().trim();
    if (
      lower.startsWith("javascript:") ||
      lower.startsWith("data:") ||
      lower.startsWith("vbscript:") ||
      lower.startsWith("//")
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

const safeUrlSchema = z.string().url().refine(
  (val) => isSafeDestinationUrl(val),
  { message: "URL must use http:// or https:// protocol and be a valid web address" },
);

export const createLinkSchema = z.object({
  url: safeUrlSchema,
  title: z.string().max(100).optional(),
  position: z.number().int().nonnegative().optional(),
  public: z.boolean().default(true),
});

export const updateLinkSchema = z.object({
  url: safeUrlSchema.optional(),
  title: z.string().max(100).optional(),
  position: z.number().int().nonnegative().optional(),
  public: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const reorderLinksSchema = z.object({
  linkIds: z.array(z.string().uuid()).min(1),
});


