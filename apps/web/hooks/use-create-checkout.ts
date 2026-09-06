"use client";

import { useMutation } from "@tanstack/react-query";
import {
  createCheckoutSession,
  type CheckoutResponse,
} from "@/apis/create-checkout";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function useCreateCheckout() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  return useMutation<CheckoutResponse, Error, void>({
    mutationFn: async () => {
      if (!session?.user) {
        router.push("/sign-in");
        throw new Error("Please sign in to upgrade to Pro.");
      }
      return createCheckoutSession();
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.assign(data.url);
      } else {
        toast.error("Unable to redirect to Stripe. Please try again.");
      }
    },
    onError: (error) => {
      toast.error(
        error.message || "Unable to start checkout. Please try again.",
      );
    },
  });
}
