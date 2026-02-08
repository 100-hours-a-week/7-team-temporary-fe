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
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
}

/*
 * Day-plan schedule 데이터를 가져오는 React Query 훅.
 * - queryKey는 (date, page, size) 조합으로 구성되어 캐시를 분리한다.
 * - 동일한 queryKey면 캐시를 재사용하고, staleTime/gcTime으로 재요청 시점을 제어한다.
 * - enabled=false면 요청을 수행하지 않는다.
 * - abort signal을 전달해 화면 전환/언마운트 시 요청을 취소할 수 있다.
 */
export function useDayPlanScheduleQuery({
  date,
  page = 1,
  size = 10,
  enabled = true,
  staleTime = 1000 * 60 * 5,
  gcTime,
  refetchOnMount = false,
  refetchOnWindowFocus = false,
}: UseDayPlanScheduleQueryOptions) {
  return useQuery({
    queryKey: homeQueryKeys.dayPlanSchedule(date, page, size),
    queryFn: ({ signal }) => fetchDayPlanSchedule({ date, page, size, signal }),
    enabled,
    staleTime,
    gcTime,
    refetchOnMount,
    refetchOnWindowFocus,
  });
}
