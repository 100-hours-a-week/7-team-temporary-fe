import { useQuery } from "@tanstack/react-query";

import { fetchDayPlanPeriodSchedules } from "../api";
import { dayPlanQueryKeys } from "./queryKeys";
import { toDayPlanPeriodSchedulesModel } from "./periodScheduleMappers";

interface UseDayPlanPeriodSchedulesQueryOptions {
  startDate: string;
  endDate: string;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
}

export function useDayPlanPeriodSchedulesQuery({
  startDate,
  endDate,
  enabled = true,
  staleTime = 60_000,
  gcTime,
  refetchOnMount = false,
  refetchOnWindowFocus = false,
}: UseDayPlanPeriodSchedulesQueryOptions) {
  return useQuery({
    queryKey: dayPlanQueryKeys.dayPlanPeriodSchedules(startDate, endDate),
    queryFn: ({ signal }) => fetchDayPlanPeriodSchedules({ startDate, endDate, signal }),
    select: toDayPlanPeriodSchedulesModel,
    enabled,
    staleTime,
    gcTime,
    refetchOnMount,
    refetchOnWindowFocus,
  });
}
