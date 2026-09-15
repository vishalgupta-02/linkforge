// apis/google-signin.ts

import { authClient } from "@/lib/auth-client";

export async function googleSignIn() {
  try {
    const dashboardCallback =
      typeof window !== "undefined"
        ? `${window.location.origin}/dashboard`
        : "http://localhost:3000/dashboard";

    const data = await authClient.signIn.social({
      provider: "google",
      callbackURL: dashboardCallback, // Redirect to dashboard after successful sign-in
    });

    return data;
  } catch (error) {
    console.error("Failed to sign in user:", error);
    throw error;
  }
}
