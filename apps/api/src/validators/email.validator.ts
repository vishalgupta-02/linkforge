import z from "zod";

export const sendTestEmailSchema = z.object({
  to: z.string().trim().email("A valid email address is required"),
});

export type SendTestEmailInput = z.infer<typeof sendTestEmailSchema>;
