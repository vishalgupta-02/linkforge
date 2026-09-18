import { createAuthClient } from 'better-auth/react'

const rawBackendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:5000");

export const authClient = createAuthClient({
  baseURL: rawBackendUrl.trim().replace(/\/+$/, ""),
})
