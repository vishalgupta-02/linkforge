"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { setSentryUser, clearSentryUser } from "@/lib/sentry-user";

/**
 * Automatically syncs the authenticated user state from Better Auth to Sentry client-side context.
 * Mounts in the Root Layout to guarantee user context coverage across all pages without manual calls.
 */
export function SentryAuthSync() {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    if (session?.user) {
      setSentryUser(session.user);
    } else {
      clearSentryUser();
    }
  }, [session, isPending]);

  return null;
}
