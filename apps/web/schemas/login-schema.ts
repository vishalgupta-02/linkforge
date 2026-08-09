import z from "zod";

const signInFormSchema = z.object({
  email: z.string().email().nonempty("Email is required"),
  password: z.string().min(6).nonempty("Password is required"),
});

export { signInFormSchema };
