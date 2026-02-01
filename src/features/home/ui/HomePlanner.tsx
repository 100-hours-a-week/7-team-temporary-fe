"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addDays,
  DAYS_IN_WEEK,
  getRepresentativeMonthIndex,
  toStartOfWeek,
} from "../model/calendar";
import { fetchDayPlanSchedule } from "../api";
import { homeQueryKeys } from "../model/queryKeys";
import { toTaskItemModelFromHomeTask } from "../model/taskMappers";
import type { TaskItemModel } from "../model/taskModels";
import { useHomePlanStore } from "../model/homePlan.store";
import { useDayPlanScheduleQuery } from "../model/useDayPlanScheduleQuery";
import { HomeTaskItem } from "./HomeTaskItem";
import { WeekDateSelector } from "./WeekDateSelector";
import { WeekHeader } from "./WeekHeader";
import { WeekdayLabels } from "./WeekdayLabels";
import { apiFetch, Endpoint } from "@/shared/api";
import type { DayPlanScheduleItemDto } from "../api/types";
interface HomePlannerProps {
  onOpenPlannerEdit: () => void;
  refreshKey?: number;
}

const PAGE_SIZE = 10;

const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function HomePlanner({
  onOpenPlannerEdit: _onOpenPlannerEdit,
  refreshKey,
}: HomePlannerProps) {
  const queryClient = useQueryClient();
  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState(() => toStartOfWeek(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [completionOverrides, setCompletionOverrides] = useState<Map<number, boolean>>(
    () => new Map(),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchedTasks, setFetchedTasks] = useState<TaskItemModel[]>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const weekDays = useMemo(
    () => Array.from({ length: DAYS_IN_WEEK }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );
  const headerMonthIndex = selectedDate
    ? selectedDate.getMonth()
    : getRepresentativeMonthIndex(weekDays);

  const queryDate = useMemo(() => formatDateParam(selectedDate ?? today), [selectedDate, today]);
  const { data, isLoading, isError } = useDayPlanScheduleQuery({
    date: queryDate,
    page: currentPage,
    size: PAGE_SIZE,
  });
  const weekPlanQueries = useQueries({
    queries: weekDays.map((day) => {
      const date = formatDateParam(day);
      return {
        queryKey: homeQueryKeys.dayPlanSchedule(date, 1, 1),
        queryFn: ({ signal }) => fetchDayPlanSchedule({ date, page: 1, size: 1, signal }),
        enabled: date !== queryDate,
        staleTime: 1000 * 60,
      };
    }),
  });
  const setHomePlan = useHomePlanStore((state) => state.setHomePlan);

  const baseTasks = useMemo(
    () =>
      data?.content.map((task) =>
        toTaskItemModelFromHomeTask({
          scheduleId: task.scheduleId,
          title: task.title,
          status: task.status,
          startAt: task.startAt,
          endAt: task.endAt,
          type: task.type,
          isUrgent: task.isUrgent,
          assignedBy: task.assignedBy,
        }),
      ) ?? [],
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
  }, [weekDays, weekPlanQueries, data?.content.length, queryDate]);
  const statusMessage = isLoading
    ? { text: "일정을 불러오는 중...", className: "text-neutral-500" }
    : isError
      ? { text: "일정을 불러오지 못했습니다.", className: "text-red-500" }
      : tasks.length === 0
        ? { text: "등록된 일정이 없습니다.", className: "text-neutral-500" }
        : null;

  const currentScheduleQuery = useQuery({
    queryKey: homeQueryKeys.currentSchedule(),
    queryFn: ({ signal }) =>
      apiFetch<DayPlanScheduleItemDto | null>(Endpoint.SCHEDULE.BASE, {
        signal,
        authRequired: true,
      }),
  });
  const currentTask = useMemo(() => {
    if (!currentScheduleQuery.data) return null;
    const baseTask = toTaskItemModelFromHomeTask({
      scheduleId: currentScheduleQuery.data.scheduleId,
      title: currentScheduleQuery.data.title,
      status: currentScheduleQuery.data.status,
      startAt: currentScheduleQuery.data.startAt,
      endAt: currentScheduleQuery.data.endAt,
      type: currentScheduleQuery.data.type,
      isUrgent: currentScheduleQuery.data.isUrgent,
      assignedBy: currentScheduleQuery.data.assignedBy,
    });
    return {
      ...baseTask,
      isCompleted: completionOverrides.get(baseTask.taskId) ?? baseTask.isCompleted,
    };
  }, [completionOverrides, currentScheduleQuery.data]);
  const currentTaskStatus = currentScheduleQuery.isLoading
    ? { text: "지금 할 일을 불러오는 중...", className: "text-neutral-500" }
    : currentScheduleQuery.isError
      ? { text: "지금 할 일을 불러오지 못했습니다.", className: "text-red-500" }
      : !currentTask
        ? { text: "지금 할 일이 없습니다.", className: "text-neutral-500" }
        : null;

  const handleMoveWeek = (offset: number) => {
    setWeekStart((prev) => addDays(prev, offset));
    setSelectedDate((prev) => (prev ? addDays(prev, offset) : null));
  };
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

  useEffect(() => {
    if (!refreshKey) return;
    queryClient.invalidateQueries({
      queryKey: homeQueryKeys.dayPlanSchedule(queryDate, 1, PAGE_SIZE),
    });
  }, [queryClient, queryDate, refreshKey]);

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

  return (
    <div className="scrollbar-hide mx-0 h-full overflow-y-auto px-[25px] py-[20px]">
      <WeekHeader
        monthIndex={headerMonthIndex}
        onPrev={() => handleMoveWeek(-7)}
        onNext={() => handleMoveWeek(7)}
      />

      <WeekdayLabels />

      <WeekDateSelector
        weekDays={weekDays}
        selectedDate={selectedDate}
        today={today}
        onSelect={setSelectedDate}
        hasPlan={(day) => planPresenceByDate.get(formatDateParam(day)) ?? false}
      />
      <div className="mt-6">
        <div className="text-ink-900 text-xl font-semibold">지금 할 일</div>
        <div className="mt-4">
          {currentTaskStatus ? (
            <div
              className={`rounded-2xl border border-neutral-200 bg-white px-4 py-6 text-center text-sm ${currentTaskStatus.className}`}
            >
              {currentTaskStatus.text}
            </div>
          ) : currentTask ? (
            <HomeTaskItem
              task={currentTask}
              onToggleComplete={handleToggleComplete}
            />
          ) : null}
        </div>
      </div>
      <div className="mt-10">
        <div className="text-ink-900 text-xl font-semibold">오늘 할 일 목록</div>
        <div className="mt-4 flex flex-col gap-4">
          {statusMessage ? (
            <div
              className={`rounded-2xl border border-neutral-200 bg-white px-4 py-6 text-center text-sm ${statusMessage.className}`}
            >
              {statusMessage.text}
            </div>
          ) : (
            <>
              {tasks.map((task) => (
                <HomeTaskItem
                  key={task.taskId}
                  task={task}
                  variant="list"
                  onToggleComplete={handleToggleComplete}
                />
              ))}
              <div
                ref={loadMoreRef}
                className="h-px"
              />
              {isLoading && hasMore ? (
                <div className="text-center text-xs text-neutral-400">불러오는 중...</div>
              ) : null}
            </>
          )}
        </div>
      </div>
      <div
        className="h-24"
        aria-hidden
      />
    </div>
  );
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
