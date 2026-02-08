import { useQuery } from "@tanstack/react-query";

import { fetchCurrentSchedule } from "../api";
import { homeQueryKeys } from "./queryKeys";

interface UseCurrentScheduleQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
}

export function useCurrentScheduleQuery(options: UseCurrentScheduleQueryOptions = {}) {
  const {
    enabled = true,
    staleTime = 60_000,
    gcTime,
    refetchOnMount = false,
    refetchOnWindowFocus = false,
  } = options;

  return useQuery({
    queryKey: homeQueryKeys.currentSchedule(),
    queryFn: ({ signal }) => fetchCurrentSchedule({ signal }),
    enabled,
    staleTime,
    gcTime,
    refetchOnMount,
    refetchOnWindowFocus,
  });
}
