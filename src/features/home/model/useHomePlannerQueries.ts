import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

import { fetchDayPlanSchedule } from "../api";
import { homeQueryKeys } from "./queryKeys";
import { useDayPlanScheduleQuery } from "./useDayPlanScheduleQuery";
import { useCurrentScheduleQuery } from "./useCurrentScheduleQuery";

const PREFETCH_RANGE_DAYS = 2;

const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function getDayStartTime(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function isWithinPrefetchRange(day: Date, anchor: Date, rangeDays: number) {
  const diff = Math.abs(getDayStartTime(day) - getDayStartTime(anchor));
  return diff <= rangeDays * 24 * 60 * 60 * 1000;
}

interface UseHomePlannerQueriesParams {
  queryDate: string;
  currentPage: number;
  pageSize: number;
  weekDays: Date[];
  prefetchAnchor: Date;
}

/*
 * HomePlanner에서 사용하는 쿼리 호출을 한곳으로 모은 훅.
 * - 메인 리스트(day-plan/schedule) 조회
 * - 주간 점표시용 prefetch(size=1) 조회
 * - 현재 일정(current-schedule) 조회
 *
 * 목적:
 * - 쿼리 의존성/옵션을 한곳에서 관리해 중복 요청을 줄임
 * - 호출부(useHomePlanner)의 렌더 책임을 줄임
 */
export function useHomePlannerQueries({
  queryDate,
  currentPage,
  pageSize,
  weekDays,
  prefetchAnchor,
}: UseHomePlannerQueriesParams) {
  const { data, isLoading, isError } = useDayPlanScheduleQuery({
    date: queryDate,
    page: currentPage,
    size: pageSize,
  });

  const weekPlanQueries = useQueries({
    queries: weekDays.map((day) => {
      const date = formatDateParam(day);
      const shouldPrefetch = isWithinPrefetchRange(day, prefetchAnchor, PREFETCH_RANGE_DAYS);
      return {
        queryKey: homeQueryKeys.dayPlanSchedule(date, 1, 1),
        queryFn: ({ signal }) => fetchDayPlanSchedule({ date, page: 1, size: 1, signal }),
        enabled: date !== queryDate && shouldPrefetch,
        staleTime: 1000 * 60,
      };
    }),
  });

  const currentScheduleQuery = useCurrentScheduleQuery();
  const currentScheduleData = currentScheduleQuery.data;

  return useMemo(
    () => ({
      data,
      isLoading,
      isError,
      weekPlanQueries,
      currentScheduleData,
      isCurrentTaskLoading: currentScheduleQuery.isLoading,
      isCurrentTaskError: currentScheduleQuery.isError,
      refetchCurrentSchedule: currentScheduleQuery.refetch,
    }),
    [
      data,
      isLoading,
      isError,
      weekPlanQueries,
      currentScheduleData,
      currentScheduleQuery.isLoading,
      currentScheduleQuery.isError,
      currentScheduleQuery.refetch,
    ],
  );
}
