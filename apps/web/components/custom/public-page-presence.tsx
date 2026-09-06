"use client";

import { useLivePresence } from "@/hooks/use-live-presence";

export function PublicProfilePresence({ username }: { username: string }) {
  useLivePresence(username);

  return null;
}
