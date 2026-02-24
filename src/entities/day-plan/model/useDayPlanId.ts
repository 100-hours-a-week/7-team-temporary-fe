import { useDayPlanScheduleQuery } from "./useDayPlanScheduleQuery";

interface UseDayPlanIdOptions {
  date: string;
  page?: number;
  size?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useDayPlanId({
  date,
  page = 1,
  size = 1,
  enabled = true,
  staleTime,
  gcTime,
}: UseDayPlanIdOptions) {
  const query = useDayPlanScheduleQuery({ date, page, size, enabled, staleTime, gcTime });

  return {
    ...query,
    dayPlanId: query.data?.dayPlanId ?? null,
  };
}
