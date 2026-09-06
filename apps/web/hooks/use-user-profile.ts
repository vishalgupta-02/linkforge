"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe, type UserProfileResponse } from "@/apis/get-user-profile";
import { authClient } from "@/lib/auth-client";

export const userProfileKeys = {
  all: ["user-profile"] as const,
  user: (userId?: string) => ["user-profile", userId] as const,
};

export function useUserProfile() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  return useQuery<UserProfileResponse | null, Error>({
    queryKey: userProfileKeys.user(userId),
    queryFn: () => (userId ? getMe(userId) : Promise.resolve(null)),
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
  });
}
