
import { authClient } from "@/lib/auth-client";

export async function userLogin(email: string, password: string) {
  try {
    const { data, error } = await authClient.signIn.email({
      email: email, 
      password: password, 
    });

    if (error) {
      throw new Error(error.message || "Invalid Credentials");
    }

    console.log("Login successful:", data);

    return data;
  } catch (error) {
    console.error("Failed to login user:", error);
    throw error;
  }
}
