"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { setSentryUser, clearSentryUser } from "@/lib/sentry-user";

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
