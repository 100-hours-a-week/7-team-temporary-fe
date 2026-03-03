"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  dayPlanScheduleQueryKeys,
  type TodoCartTaskItemModel,
  useDayPlanScheduleByIdQuery,
} from "@/entities/day-plan-schedule";
import { TASK_BASKET_SCHEDULE_PAGE_SIZE } from "./constants";

export type TaskBasketScheduleTask = TodoCartTaskItemModel & { status?: "TODO" | "DONE" };
export type InvalidateScheduleKeys = Array<readonly unknown[]>;

interface UseTaskBasketScheduleListQueryParams {
  dayPlanId: number | null;
  dayPlanDate: string | null;
  localTasks: TaskBasketScheduleTask[];
}

export function useTaskBasketScheduleListQuery({
  dayPlanId,
  dayPlanDate,
  localTasks,
}: UseTaskBasketScheduleListQueryParams) {
  const today = useMemo(() => new Date(), []);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const scrollRootRef = useRef<HTMLElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchedTasks, setFetchedTasks] = useState<TaskBasketScheduleTask[]>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const scheduleQuery = useDayPlanScheduleByIdQuery({
    dayPlanId: dayPlanId ?? 0,
    page: currentPage,
    size: TASK_BASKET_SCHEDULE_PAGE_SIZE,
    enabled: Boolean(dayPlanId),
  });

  const selectedDate = useMemo(() => {
    if (!dayPlanDate) return today;
    const parsed = new Date(dayPlanDate);
    return Number.isNaN(parsed.getTime()) ? today : parsed;
  }, [dayPlanDate, today]);

  const invalidateScheduleKeys = useMemo(
    () =>
      dayPlanScheduleQueryKeys.dayPlanScheduleCacheKeys({
        dayPlanId,
        dayPlanDate,
        page: currentPage,
        size: TASK_BASKET_SCHEDULE_PAGE_SIZE,
      }),
    [currentPage, dayPlanDate, dayPlanId],
  ) as InvalidateScheduleKeys;

  useEffect(() => {
    if (!contentRef.current) return;
    scrollRootRef.current = contentRef.current.closest(
      ".overflow-y-auto, .overflow-auto, .overflow-y-scroll",
    ) as HTMLElement | null;
  }, []);

  useEffect(() => {
    if (!dayPlanId) return;
    setCurrentPage(1);
    setFetchedTasks([]);
    setTotalPages(null);
  }, [dayPlanId]);

  const mappedTasks = useMemo(
    () =>
      scheduleQuery.data?.content.map((item) => ({
        scheduleId: item.scheduleId,
        title: item.title,
        type: item.type,
        startAt: item.startAt,
        endAt: item.endAt,
        estimatedTimeRange: item.estimatedTimeRange,
        focusLevel: item.focusLevel,
        isUrgent: item.isUrgent,
        assignedBy: item.assignedBy,
        assignmentStatus: item.assignmentStatus,
        status: item.status,
      })) ?? [],
    [scheduleQuery.data],
  );

  useEffect(() => {
    if (!scheduleQuery.data) return;
    setTotalPages(scheduleQuery.data.totalPages);
    setFetchedTasks((prev) => {
      const base = currentPage === 1 ? [] : prev;
      const map = new Map(base.map((task) => [task.scheduleId, task]));
      mappedTasks.forEach((task) => map.set(task.scheduleId, task));
      return Array.from(map.values());
    });
  }, [currentPage, mappedTasks, scheduleQuery.data]);

  const hasMore = useMemo(
    () =>
      totalPages === null
        ? mappedTasks.length === TASK_BASKET_SCHEDULE_PAGE_SIZE
        : currentPage < totalPages,
    [currentPage, mappedTasks.length, totalPages],
  );

  const handleLoadMore = useCallback(() => {
    if (scheduleQuery.isFetching || !hasMore) return;
    setCurrentPage((prev) => prev + 1);
  }, [hasMore, scheduleQuery.isFetching]);

  const mergedTasks = useMemo(() => {
    const map = new Map<number, TaskBasketScheduleTask>();
    fetchedTasks.forEach((task) => map.set(task.scheduleId, task));
    localTasks.forEach((task) => map.set(task.scheduleId, task));
    return Array.from(map.values());
  }, [fetchedTasks, localTasks]);

  const removeFetchedTask = useCallback((scheduleId: number) => {
    setFetchedTasks((prev) => prev.filter((task) => task.scheduleId !== scheduleId));
  }, []);

  return {
    contentRef,
    scrollRootRef,
    selectedDate,
    invalidateScheduleKeys,
    mergedTasks,
    hasMore,
    isFetchingMore: scheduleQuery.isFetching,
    isScheduleLoading: scheduleQuery.isLoading,
    scheduleData: scheduleQuery.data,
    handleLoadMore,
    removeFetchedTask,
  };
}
