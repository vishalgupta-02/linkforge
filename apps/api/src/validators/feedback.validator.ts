import { z } from "zod";

export const feedbackSchema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Please enter a valid email address").optional().or(z.literal("")),
  category: z.enum(["general", "bug", "feature", "billing", "question", "other"]).default("general"),
  rating: z.number().int().min(1).max(5).optional().default(5),
  message: z
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters long")
    .max(3000, "Message cannot exceed 3000 characters"),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
