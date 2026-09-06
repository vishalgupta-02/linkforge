import { z } from "zod";

export const liveVisitorParamsSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

export const liveVisitorBodySchema = z.object({
  sessionId: z.string().uuid("Invalid session ID format. Must be a valid UUID"),
});
