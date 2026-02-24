import {
  useCurrentScheduleQuery,
  useDayPlanPeriodSchedulesQuery,
  useDayPlanScheduleQuery,
} from "@/entities/day-plan";

interface UseHomePlannerQueriesParams {
  queryDate: string;
  currentPage: number;
  pageSize: number;
  weekStartDate: string;
  weekEndDate: string;
  enabled?: boolean;
}

interface UseHomePlannerQueriesResult {
  data: ReturnType<typeof useDayPlanScheduleQuery>["data"];
  isLoading: boolean;
  isError: boolean;
  periodSchedulesModel: ReturnType<typeof useDayPlanPeriodSchedulesQuery>["data"];
  currentScheduleData: ReturnType<typeof useCurrentScheduleQuery>["data"];
  isCurrentTaskLoading: boolean;
  isCurrentTaskError: boolean;
}

/*
 * HomePlanner에서 사용하는 쿼리 호출을 한곳으로 모은 훅.
 * - 메인 리스트(day-plan/schedule) 조회
 * - 주간 점표시용 기간 hasPlan 조회
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
  weekStartDate,
  weekEndDate,
  enabled = true,
}: UseHomePlannerQueriesParams): UseHomePlannerQueriesResult {
  const { data, isLoading, isError } = useDayPlanScheduleQuery({
    date: queryDate,
    page: currentPage,
    size: pageSize,
    enabled,
  });

  const periodSchedulesQuery = useDayPlanPeriodSchedulesQuery({
    startDate: weekStartDate,
    endDate: weekEndDate,
    enabled,
  });

  const currentScheduleQuery = useCurrentScheduleQuery({ enabled });

  return {
    data,
    isLoading,
    isError,
    periodSchedulesModel: periodSchedulesQuery.data,
    currentScheduleData: currentScheduleQuery.data,
    isCurrentTaskLoading: currentScheduleQuery.isLoading,
    isCurrentTaskError: currentScheduleQuery.isError,
  };
}
