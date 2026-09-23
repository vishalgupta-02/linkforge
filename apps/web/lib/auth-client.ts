import { createAuthClient } from "better-auth/react";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const authClient = createAuthClient({
  baseURL: backendUrl.trim().replace(/\/+$/, ""),
  fetchOptions: {
    credentials: "include",
  },
});
