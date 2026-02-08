import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { toTaskItemModelFromHomeTask } from "./taskMappers";
import type { TaskItemModel } from "./taskModels";
import { useHomePlanStore } from "./homePlan.store";
import { useHomePlannerCalendar } from "./useHomePlannerCalendar";
import { useHomePlannerQueries } from "./useHomePlannerQueries";

const PAGE_SIZE = 10;
const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function formatScheduleLabel(date: Date) {
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const labels = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = labels[date.getDay()] ?? "";
  return `${month}.${day} (${weekday}) 일정`;
}

function getScrollParent(element: HTMLElement | null) {
  if (!element || typeof window === "undefined") return null;
  const classRoot = element.closest(
    ".overflow-y-auto, .overflow-auto, .overflow-y-scroll",
  ) as HTMLElement | null;
  if (classRoot) return classRoot;
  let current: HTMLElement | null = element.parentElement;
  while (current) {
    const styles = window.getComputedStyle(current);
    const overflowY = styles.overflowY;
    const overflow = styles.overflow;
    if (
      overflowY === "auto" ||
      overflowY === "scroll" ||
      overflow === "auto" ||
      overflow === "scroll"
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

interface PlannerStatusMessage {
  text: string;
  className: string;
}

interface UseHomePlannerResult {
  today: Date;
  weekDays: Date[];
  headerMonthIndex: number;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  todayScheduleLabel: string;
  tasks: TaskItemModel[];
  statusMessage: PlannerStatusMessage | null;
  currentTask: TaskItemModel | null;
  currentTaskStatus: PlannerStatusMessage | null;
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
  const [fetchedTasks, setFetchedTasks] = useState<TaskItemModel[]>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const queryDate = useMemo(() => formatDateParam(selectedDate ?? today), [selectedDate, today]);
  const prefetchAnchor = selectedDate ?? today;
  const {
    data,
    isLoading,
    isError,
    weekPlanQueries,
    currentScheduleData,
    isCurrentTaskLoading,
    isCurrentTaskError,
    refetchCurrentSchedule,
  } = useHomePlannerQueries({
    queryDate,
    currentPage,
    pageSize: PAGE_SIZE,
    weekDays,
    prefetchAnchor,
  });
  const setHomePlan = useHomePlanStore((state) => state.setHomePlan);

  const baseTasks = useMemo(
    () => data?.content.map((task) => toTaskItemModelFromHomeTask(task)) ?? [],
    [data],
  );

  useEffect(() => {
    setCurrentPage(1);
    setFetchedTasks([]);
    setTotalPages(null);
  }, [queryDate]);

  useEffect(() => {
    if (!data) return;
    setTotalPages(data.totalPages);
    setFetchedTasks((prev) => {
      const base = currentPage === 1 ? [] : prev;
      const map = new Map(base.map((task) => [task.taskId, task]));
      baseTasks.forEach((task) => map.set(task.taskId, task));
      return Array.from(map.values());
    });
  }, [baseTasks, currentPage, data]);

  const tasks = useMemo(
    () =>
      fetchedTasks.map((task) => ({
        ...task,
        isCompleted: completionOverrides.get(task.taskId) ?? task.isCompleted,
      })),
    [completionOverrides, fetchedTasks],
  );
  const planPresenceByDate = useMemo(() => {
    const map = new Map<string, boolean>();
    weekDays.forEach((day, index) => {
      const date = formatDateParam(day);
      if (date === queryDate) {
        map.set(date, (data?.totalElements ?? 0) > 0);
        return;
      }
      const query = weekPlanQueries[index];
      map.set(date, (query?.data?.content.length ?? 0) > 0);
    });
    return map;
  }, [weekDays, weekPlanQueries, data?.totalElements, queryDate]);
  const hasPlan = useCallback(
    (day: Date) => planPresenceByDate.get(formatDateParam(day)) ?? false,
    [planPresenceByDate],
  );
  const statusMessage = isError
    ? { text: "일정을 불러오지 못했습니다.", className: "text-red-500" }
    : !isLoading && tasks.length === 0
      ? { text: "등록된 일정이 없습니다.", className: "text-neutral-500" }
      : null;

  const baseCompletionById = useMemo(
    () => new Map(baseTasks.map((task) => [task.taskId, task.isCompleted])),
    [baseTasks],
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
  const currentTaskStatus = isCurrentTaskError
    ? { text: "지금 할 일을 불러오지 못했습니다.", className: "text-red-500" }
    : !isCurrentTaskLoading && !currentTask
      ? { text: "지금 할 일이 없습니다.", className: "text-neutral-500" }
      : null;

  const todayScheduleLabel = useMemo(
    () => formatScheduleLabel(selectedDate ?? today),
    [selectedDate, today],
  );

  useEffect(() => {
    if (data?.dayPlanId) {
      setHomePlan(data.dayPlanId, queryDate);
    }
  }, [data?.dayPlanId, queryDate, setHomePlan]);

  const hasMore = totalPages === null ? baseTasks.length === PAGE_SIZE : currentPage < totalPages;

  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (!hasMore) return;
    if (isLoading) return;

    const root = getScrollParent(loadMoreRef.current);
    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting);
        if (!isIntersecting) return;
        setCurrentPage((prev) => prev + 1);
      },
      { root, rootMargin: "200px" },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading]);

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
