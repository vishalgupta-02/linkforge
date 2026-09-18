
import { authClient } from "@/lib/auth-client";

export async function googleSignIn(customCallbackUrl?: string) {
  try {
    const dashboardCallback =
      customCallbackUrl ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/dashboard?auth=google_success`
        : "http://localhost:3000/dashboard?auth=google_success");

    const data = await authClient.signIn.social({
      provider: "google",
      callbackURL: dashboardCallback, 
    });

    return data;
  } catch (error) {
    console.error("Failed to sign in user:", error);
    throw error;
  }
}
