"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getAnalytics,
  type AnalyticsRange,
  type AnalyticsResponse,
} from "@/apis/get-analytics";
import { authClient } from "@/lib/auth-client";

export const analyticsKeys = {
  all: ["analytics"] as const,
  user: (userId?: string) => ["analytics", userId] as const,
  range: (userId: string | undefined, range: AnalyticsRange) =>
    ["analytics", userId, range] as const,
};

export function useAnalytics(range: AnalyticsRange = "7d") {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  return useQuery<AnalyticsResponse, Error>({
    queryKey: analyticsKeys.range(userId, range),
    queryFn: () => getAnalytics(range),
    enabled: Boolean(userId),
    staleTime: 30 * 1000, // 30s cache alignment with Redis
    placeholderData: keepPreviousData,
  });
}
