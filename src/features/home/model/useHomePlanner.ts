import { useCallback, useEffect, useMemo, useState } from "react";
import type { RefObject } from "react";
import {
  toTaskItemModelFromHomeTask,
  type TaskItemModel,
  useHomePlanStore,
} from "@/entities/day-plan";
import { useInfiniteScrollTrigger } from "@/shared/hooks";
import { useHomePlannerCalendar } from "./useHomePlannerCalendar";
import { useHomePlannerQueries } from "./useHomePlannerQueries";
import { useMergedTasks } from "./useMergedTasks";
import { toHomeWeekPlanPresenceVM } from "./planPresenceViewModel";
import { usePlannerStatus } from "./usePlannerStatus";

const PAGE_SIZE = 10;
const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface UseHomePlannerResult {
  today: Date;
  weekDays: Date[];
  headerMonthIndex: number;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  todayScheduleLabel: string;
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

export function useHomePlanner(): UseHomePlannerResult {
  const { today, weekDays, headerMonthIndex, selectedDate, setSelectedDate, handleMoveWeek } =
    useHomePlannerCalendar();
  const [completionOverrides, setCompletionOverrides] = useState<Map<number, boolean>>(
    () => new Map(),
  );
  const [currentPage, setCurrentPage] = useState(1);

  const queryDate = useMemo(() => formatDateParam(selectedDate ?? today), [selectedDate, today]);
  const weekStartDate = useMemo(() => formatDateParam(weekDays[0]), [weekDays]);
  const weekEndDate = useMemo(() => formatDateParam(weekDays[weekDays.length - 1]), [weekDays]);
  const {
    data,
    isLoading,
    isError,
    periodSchedulesModel,
    currentScheduleData,
    isCurrentTaskLoading,
    isCurrentTaskError,
  } = useHomePlannerQueries({
    queryDate,
    currentPage,
    pageSize: PAGE_SIZE,
    weekStartDate,
    weekEndDate,
  });
  const setHomePlan = useHomePlanStore((state) => state.setHomePlan);

  useEffect(() => {
    setCurrentPage(1);
  }, [queryDate]);

  const { tasks, baseCompletionById, hasMore } = useMergedTasks({
    data,
    currentPage,
    pageSize: PAGE_SIZE,
    overrides: completionOverrides,
    resetKey: queryDate,
  });

  const weekDates = useMemo(() => weekDays.map((day) => formatDateParam(day)), [weekDays]);
  const hasPlanVM = useMemo(
    () =>
      toHomeWeekPlanPresenceVM({
        weekDates,
        periodSchedules: periodSchedulesModel,
        selectedDate: queryDate,
        selectedDateHasPlan: data?.totalElements !== undefined ? data.totalElements > 0 : undefined,
      }),
    [weekDates, periodSchedulesModel, queryDate, data?.totalElements],
  );

  const hasPlan = useCallback(
    (day: Date) => hasPlanVM.hasPlanByDate.get(formatDateParam(day)) ?? false,
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
    if (!currentScheduleData) return null;
    const baseTask = toTaskItemModelFromHomeTask(currentScheduleData);
    return {
      ...baseTask,
      isCompleted: completionOverrides.get(baseTask.taskId) ?? baseTask.isCompleted,
    };
  }, [completionOverrides, currentScheduleData]);
  const { statusMessage, currentTaskStatus, todayScheduleLabel } = usePlannerStatus({
    isError,
    isLoading,
    tasks,
    currentTask,
    isCurrentTaskLoading,
    isCurrentTaskError,
    selectedDate: selectedDate ?? today,
  });
  // 상태 메시지/표시 텍스트는 usePlannerStatus에서 파생

  useEffect(() => {
    if (data?.dayPlanId) {
      setHomePlan(data.dayPlanId, queryDate);
    }
  }, [data?.dayPlanId, queryDate, setHomePlan]);

  const { loadMoreRef } = useInfiniteScrollTrigger<HTMLDivElement>({
    hasMore,
    isFetching: isLoading,
    onLoadMore: () => setCurrentPage((prev) => prev + 1),
  });

  return {
    today,
    weekDays,
    headerMonthIndex,
    selectedDate,
    setSelectedDate,
    todayScheduleLabel,
    tasks,
    statusMessage,
    currentTask,
    currentTaskStatus,
    isCurrentTaskLoading,
    handleToggleComplete,
    handleMoveWeek,
    hasPlan,
    hasMore,
    isLoading,
    loadMoreRef,
  };
}
