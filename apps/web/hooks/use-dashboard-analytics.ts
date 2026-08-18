"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnalytics, type AnalyticsResponse } from "@/apis/get-analytics";
import { authClient } from "@/lib/auth-client";

export const dashboardAnalyticsKeys = {
  all: ["dashboard"] as const,
  user: (userId?: string) => ["dashboard", userId] as const,
};

export function useDashboardAnalytics() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  return useQuery<AnalyticsResponse, Error>({
    queryKey: dashboardAnalyticsKeys.user(userId),
    queryFn: () => getAnalytics("7d"),
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  });
}
