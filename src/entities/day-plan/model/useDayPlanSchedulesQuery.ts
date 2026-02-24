import { useQuery } from "@tanstack/react-query";

import { fetchDayPlanSchedules } from "../api";
import type { DayPlanScheduleFilterStatus } from "../api";
import { dayPlanQueryKeys } from "./queryKeys";

interface UseDayPlanSchedulesQueryOptions {
  dayPlanId: number;
  status?: DayPlanScheduleFilterStatus;
  page?: number;
  size?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useDayPlanSchedulesQuery({
  dayPlanId,
  status,
  page = 1,
  size = 10,
  enabled = true,
  staleTime,
  gcTime,
}: UseDayPlanSchedulesQueryOptions) {
  return useQuery({
    queryKey: dayPlanQueryKeys.dayPlanSchedulesById(dayPlanId, status ?? "ALL", page, size),
    queryFn: ({ signal }) => fetchDayPlanSchedules({ dayPlanId, status, page, size, signal }),
    enabled,
    staleTime,
    gcTime,
  });
}
