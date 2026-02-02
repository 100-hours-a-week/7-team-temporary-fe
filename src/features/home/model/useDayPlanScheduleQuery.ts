import { useQuery } from "@tanstack/react-query";

import { fetchDayPlanSchedule } from "../api";
import { homeQueryKeys } from "./queryKeys";

interface UseDayPlanScheduleQueryOptions {
  date: string;
  page?: number;
  size?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useDayPlanScheduleQuery({
  date,
  page = 1,
  size = 10,
  enabled = true,
  staleTime,
  gcTime,
}: UseDayPlanScheduleQueryOptions) {
  return useQuery({
    queryKey: homeQueryKeys.dayPlanSchedule(date, page, size),
    queryFn: ({ signal }) => fetchDayPlanSchedule({ date, page, size, signal }),
    enabled,
    staleTime,
    gcTime,
  });
}
