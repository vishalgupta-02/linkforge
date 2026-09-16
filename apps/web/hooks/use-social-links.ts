"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  reorderSocialLinksApi,
  type SocialLink,
} from "@/apis/social-links";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export const socialLinksKeys = {
  all: ["social-links"] as const,
  user: (userId?: string) => ["social-links", userId] as const,
};

export function useSocialLinks() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  return useQuery<SocialLink[], Error>({
    queryKey: socialLinksKeys.user(userId),
    queryFn: getSocialLinks,
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  });
}

export function useSocialLinkMutations() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const createMutation = useMutation({
    mutationFn: createSocialLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialLinksKeys.all });
      toast.success("Social link added successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to add social link");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSocialLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialLinksKeys.all });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to update social link");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSocialLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialLinksKeys.all });
      toast.success("Social link removed");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to remove social link");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: reorderSocialLinksApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialLinksKeys.all });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to reorder social links");
    },
  });

  return {
    createSocial: createMutation,
    updateSocial: updateMutation,
    deleteSocial: deleteMutation,
    reorderSocials: reorderMutation,
  };
}
