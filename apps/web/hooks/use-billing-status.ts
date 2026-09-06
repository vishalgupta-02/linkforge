"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getBillingStatus,
  type BillingStatusResponse,
} from "@/apis/get-billing-status";
import { authClient } from "@/lib/auth-client";

export function useBillingStatus() {
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const userId = session?.user?.id;

  return useQuery<BillingStatusResponse, Error>({
    queryKey: ["billingStatus", userId],
    queryFn: getBillingStatus,
    enabled: !isAuthPending && Boolean(userId),
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
}
