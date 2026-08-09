// apis/user-login.ts

import { authClient } from "@/lib/auth-client";

export async function userLogin(email: string, password: string) {
  try {
    const { data, error } = await authClient.signIn.email({
      email: email, // required
      password: password, // required
    });

    if (error) {
      throw new Error("Invalid Credentials");
    }

    console.log("Login successful:", data);

    return data;
  } catch (error) {
    console.error("Failed to login user:", error);
    throw error;
  }
}
