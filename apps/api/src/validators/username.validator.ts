import { z } from "zod";
import { isReservedUsername, isValidUsername } from "../utils/username.ts";

const Username = z
  .string()
  .min(3, "Username length should be minimum 3 characters")
  .refine(isValidUsername, {
    message: "Valid username is required",
  })
  .refine((username) => !isReservedUsername(username), {
    message: "This username is not available",
  });

const changeUsernameSchema = z.object({
  username: Username,
});

export { Username, changeUsernameSchema };
