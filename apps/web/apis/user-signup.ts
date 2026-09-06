// apis/user-signup.ts

import { authClient } from "@/lib/auth-client";

export async function userSignup(
  name: string,
  email: string,
  password: string,
) {
  try {
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
    });

    if (error) {
      throw new Error(error.message || "Failed to create account");
    }

    console.log("Signup successful:", data);
    return data;
  } catch (error) {
    console.error("Failed to sign up user:", error);
    throw error;
  }
}
