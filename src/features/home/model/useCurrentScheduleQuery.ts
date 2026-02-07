import { useQuery } from "@tanstack/react-query";

import { fetchCurrentSchedule } from "../api";
import { homeQueryKeys } from "./queryKeys";

export function useCurrentScheduleQuery() {
  return useQuery({
    queryKey: homeQueryKeys.currentSchedule(),
    queryFn: ({ signal }) => fetchCurrentSchedule({ signal }),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
}
