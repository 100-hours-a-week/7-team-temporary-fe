import { useQuery } from "@tanstack/react-query";

import { fetchMyProfile } from "../api";
import { userQueryKeys } from "./queryKeys";

interface UseMyProfileQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useMyProfileQuery(options: UseMyProfileQueryOptions = {}) {
  const { enabled = true, staleTime, gcTime } = options;

  return useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: ({ signal }) => fetchMyProfile(signal),
    enabled,
    staleTime,
    gcTime,
  });
}
