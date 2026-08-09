// apis/google-signin.ts

import { authClient } from "@/lib/auth-client";

export async function googleSignIn() {
  try {
    const data = await authClient.signIn.social({
      provider: "google",
      callbackURL: "http://localhost:3000/dashboard", // Redirect to dashboard after successful sign-in
    });

    return data;
  } catch (error) {
    console.error("Failed to sign in user:", error);
    throw error;
  }
}
