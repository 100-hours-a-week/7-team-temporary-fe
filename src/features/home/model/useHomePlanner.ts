import { useCallback, useEffect, useMemo, useState } from "react";
import type { RefObject } from "react";
import { toTaskItemModelFromHomeTask, type TaskItemModel } from "@/entities/day-plan-schedule";
import { useHomePlanStore } from "@/entities/day-plan";
import { useInfiniteScrollTrigger } from "@/shared/hooks";
import { formatDateToYmd } from "./date";
import { useHomePlannerCalendar } from "./useHomePlannerCalendar";
import { useHomePlannerQueries } from "./useHomePlannerQueries";
import { useMergedTasks } from "./useMergedTasks";
import { toHomeWeekPlanPresenceVM } from "./planPresenceViewModel";
import { usePlannerStatus } from "./usePlannerStatus";

const PAGE_SIZE = 10;

interface UseHomePlannerResult {
  today: Date;
  weekDays: Date[];
  headerMonthIndex: number;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  todayScheduleLabel: string;
  isWeeklyReportAvailable: boolean;
  tasks: TaskItemModel[];
  statusMessage: ReturnType<typeof usePlannerStatus>["statusMessage"];
  currentTask: TaskItemModel | null;
  currentTaskStatus: ReturnType<typeof usePlannerStatus>["currentTaskStatus"];
  isCurrentTaskLoading: boolean;
  handleToggleComplete: (taskId: number) => void;
  handleMoveWeek: (offset: number) => void;
  hasPlan: (day: Date) => boolean;
  hasMore: boolean;
  isLoading: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
}

interface UseHomePlannerOptions {
  enabled?: boolean;
}

export function useHomePlanner({
  enabled = true,
}: UseHomePlannerOptions = {}): UseHomePlannerResult {
  const { today, weekDays, headerMonthIndex, selectedDate, setSelectedDate, handleMoveWeek } =
    useHomePlannerCalendar();
  const [completionOverrides, setCompletionOverrides] = useState<Map<number, boolean>>(
    () => new Map(),
  );
  const [currentPage, setCurrentPage] = useState(1);

  const queryDate = useMemo(() => formatDateToYmd(selectedDate ?? today), [selectedDate, today]);
  const weekStartDate = useMemo(() => formatDateToYmd(weekDays[0]), [weekDays]);
  const weekEndDate = useMemo(() => formatDateToYmd(weekDays[weekDays.length - 1]), [weekDays]);
  const { scheduleQuery, periodSchedulesQuery, currentScheduleQuery } = useHomePlannerQueries({
    queryDate,
    currentPage,
    pageSize: PAGE_SIZE,
    weekStartDate,
    weekEndDate,
    enabled,
  });
  const setHomePlan = useHomePlanStore((state) => state.setHomePlan);

  useEffect(() => {
    setCurrentPage(1);
  }, [queryDate]);

  const { tasks, baseCompletionById, hasMore } = useMergedTasks({
    data: scheduleQuery.data,
    currentPage,
    pageSize: PAGE_SIZE,
    overrides: completionOverrides,
    resetKey: queryDate,
  });

  const weekDates = useMemo(() => weekDays.map((day) => formatDateToYmd(day)), [weekDays]);
  const isWeeklyReportAvailable = useMemo(() => {
    const weekEndDate = new Date(weekDays[weekDays.length - 1]);
    weekEndDate.setHours(23, 59, 59, 999);
    return today.getTime() > weekEndDate.getTime();
  }, [today, weekDays]);

  const hasPlanVM = useMemo(
    () =>
      toHomeWeekPlanPresenceVM({
        weekDates,
        periodSchedules: periodSchedulesQuery.data,
        selectedDate: queryDate,
        selectedDateHasPlan:
          scheduleQuery.data?.totalElements !== undefined
            ? scheduleQuery.data.totalElements > 0
            : undefined,
      }),
    [weekDates, periodSchedulesQuery.data, queryDate, scheduleQuery.data?.totalElements],
  );

  const hasPlan = useCallback(
    (day: Date) => hasPlanVM.hasPlanByDate.get(formatDateToYmd(day)) ?? false,
    [hasPlanVM],
  );
  const handleToggleComplete = useCallback(
    (taskId: number) => {
      setCompletionOverrides((prev) => {
        const next = new Map(prev);
        const current = next.get(taskId) ?? baseCompletionById.get(taskId) ?? false;
        next.set(taskId, !current);
        return next;
      });
    },
    [baseCompletionById],
  );

  const currentTask = useMemo(() => {
    if (!currentScheduleQuery.data) return null;
    const baseTask = toTaskItemModelFromHomeTask(currentScheduleQuery.data);
    return {
      ...baseTask,
      isCompleted: completionOverrides.get(baseTask.taskId) ?? baseTask.isCompleted,
    };
  }, [completionOverrides, currentScheduleQuery.data]);
  const { statusMessage, currentTaskStatus, todayScheduleLabel } = usePlannerStatus({
    isError: scheduleQuery.isError,
    isLoading: scheduleQuery.isLoading,
    tasks,
    currentTask,
    isCurrentTaskLoading: currentScheduleQuery.isLoading,
    isCurrentTaskError: currentScheduleQuery.isError,
    selectedDate: selectedDate ?? today,
  });
  // 상태 메시지/표시 텍스트는 usePlannerStatus에서 파생

  useEffect(() => {
    if (scheduleQuery.data?.dayPlanId) {
      setHomePlan(scheduleQuery.data.dayPlanId, queryDate);
    }
  }, [scheduleQuery.data?.dayPlanId, queryDate, setHomePlan]);

  const { loadMoreRef } = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled,
    hasMore,
    isFetching: scheduleQuery.isFetching,
    onLoadMore: () => setCurrentPage((prev) => prev + 1),
  });

  return {
    today,
    weekDays,
    headerMonthIndex,
    selectedDate,
    setSelectedDate,
    todayScheduleLabel,
    isWeeklyReportAvailable,
    tasks,
    statusMessage,
    currentTask,
    currentTaskStatus,
    isCurrentTaskLoading: currentScheduleQuery.isLoading,
    handleToggleComplete,
    handleMoveWeek,
    hasPlan,
    hasMore,
    isLoading: scheduleQuery.isLoading,
    loadMoreRef,
  };
}
