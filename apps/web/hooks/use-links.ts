"use client";

import { useQuery } from "@tanstack/react-query";
import { getLinks, type Link } from "@/apis/get-links";
import { authClient } from "@/lib/auth-client";

export const linksKeys = {
  all: ["links"] as const,
  user: (userId?: string) => ["links", userId] as const,
};

export function useLinks() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  return useQuery<Link[], Error>({
    queryKey: linksKeys.user(userId),
    queryFn: getLinks,
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  });
}
