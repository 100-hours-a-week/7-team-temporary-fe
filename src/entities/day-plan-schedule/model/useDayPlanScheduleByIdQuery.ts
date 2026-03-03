import { useQuery } from "@tanstack/react-query";

import { fetchDayPlanScheduleById } from "../api";
import { dayPlanScheduleQueryKeys } from "./queryKeys";
import { toDayPlanScheduleListModel } from "./scheduleMappers";

interface UseDayPlanScheduleByIdQueryOptions {
  dayPlanId: number;
  page?: number;
  size?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useDayPlanScheduleByIdQuery({
  dayPlanId,
  page = 1,
  size = 10,
  enabled = true,
  staleTime,
  gcTime,
}: UseDayPlanScheduleByIdQueryOptions) {
  return useQuery({
    queryKey: dayPlanScheduleQueryKeys.dayPlanScheduleById(dayPlanId, page, size),
    queryFn: ({ signal }) => fetchDayPlanScheduleById({ dayPlanId, page, size, signal }),
    select: toDayPlanScheduleListModel,
    enabled,
    staleTime,
    gcTime,
  });
}
