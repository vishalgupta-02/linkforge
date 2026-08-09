import { useQuery } from "@tanstack/react-query";
import { getPublicProfile } from "../apis/get-public-profile";

export function usePublicProfile(username: string) {
  return useQuery({
    queryKey: ["public-profile", username],
    queryFn: () => getPublicProfile(username),
    retry: 1,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
