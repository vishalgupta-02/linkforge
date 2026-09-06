"use client";

import { useMutation } from "@tanstack/react-query";
import {
  getBillingPortalSession,
  type BillingPortalResponse,
} from "@/apis/get-billing-portal";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function useBillingPortal() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  return useMutation<BillingPortalResponse, Error, void>({
    mutationFn: async () => {
      if (!session?.user) {
        router.push("/sign-in");
        throw new Error("Please sign in to manage your subscription.");
      }
      return getBillingPortalSession();
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.assign(data.url);
      } else {
        toast.error("Unable to redirect to Billing Portal. Please try again.");
      }
    },
    onError: (error) => {
      toast.error(
        error.message || "Unable to open billing portal. Please try again.",
      );
    },
  });
}
