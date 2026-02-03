import styled from "@emotion/styled";

import type { RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { TodoCartTaskItemModel } from "../model/taskModels";
import { useDayPlanScheduleByIdQuery } from "../model/useDayPlanScheduleByIdQuery";
import { TodoCartTaskItem } from "./TodoCartTaskItem";
import type { TodoCartViewMode } from "./TodoCartTaskItem";

type TodoListTask = TodoCartTaskItemModel & { status?: "TODO" | "DONE" };

interface TodoListProps {
  tasks: TodoListTask[];
  onEdit: (task: TodoListTask) => void;
  onDelete: (scheduleId: number) => void;
  dayPlanId?: number | null;
  page?: number;
  size?: number;
  scrollRootRef?: RefObject<HTMLElement | null>;
}

const EMPTY_TEXT = "작성된 할 일이 없습니다.";

/**
 * 모든 작업 목록을 렌더링하는 리스트 컨테이너.
 */
export function TodoList({
  tasks,
  onEdit,
  onDelete,
  dayPlanId,
  page = 1,
  size = 10,
  scrollRootRef,
}: TodoListProps) {
  const shouldFetch = Boolean(dayPlanId);
  const [currentPage, setCurrentPage] = useState(page);
  const [fetchedTasks, setFetchedTasks] = useState<TodoListTask[]>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const scheduleQuery = useDayPlanScheduleByIdQuery({
    dayPlanId: dayPlanId ?? 0,
    page: currentPage,
    size,
    enabled: shouldFetch,
  });

  useEffect(() => {
    if (!shouldFetch) return;
    setCurrentPage(page);
    setFetchedTasks([]);
    setTotalPages(null);
  }, [dayPlanId, page, shouldFetch]);

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

  const hasMore = totalPages === null ? mappedTasks.length === size : currentPage < totalPages;

  useEffect(() => {
    if (!shouldFetch) return;
    if (!loadMoreRef.current) return;
    if (!hasMore) return;
    if (scheduleQuery.isFetching) return;

    const root = scrollRootRef?.current ?? getScrollParent(loadMoreRef.current);
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
  }, [hasMore, scheduleQuery.isFetching, scrollRootRef, shouldFetch]);

  const mergedTasks = useMemo(() => {
    if (!shouldFetch) return tasks;
    const map = new Map<number, TodoListTask>();
    fetchedTasks.forEach((task) => map.set(task.scheduleId, task));
    tasks.forEach((task) => map.set(task.scheduleId, task));
    return Array.from(map.values());
  }, [fetchedTasks, shouldFetch, tasks]);

  const visibleTasks = mergedTasks
    .filter((task) => task.status !== "DONE")
    .sort((left, right) => sortByStartTimeDesc(left.startAt, right.startAt));

  if (visibleTasks.length === 0) {
    return <EmptyState>{EMPTY_TEXT}</EmptyState>;
  }

  return (
    <ListContainer>
      {visibleTasks.map((task) => (
        <TodoCartTaskItem
          key={task.scheduleId}
          task={task}
          viewMode={getViewMode(task)}
          onEdit={(item) => onEdit(item as TodoListTask)}
          onDelete={onDelete}
        />
      ))}
      {shouldFetch ? (
        <>
          <LoadMoreTrigger ref={loadMoreRef} />
          {scheduleQuery.isFetching && hasMore ? (
            <LoadMoreIndicator>불러오는 중...</LoadMoreIndicator>
          ) : null}
        </>
      ) : null}
    </ListContainer>
  );
}

function getViewMode(task: TodoListTask): TodoCartViewMode {
  if (task.assignmentStatus === "ASSIGNED" || task.assignmentStatus === "FIXED") {
    return "ARRANGED";
  }
  return "UNASSIGNED";
}

function sortByStartTimeDesc(left?: string, right?: string) {
  const leftMinutes = toMinutes(left);
  const rightMinutes = toMinutes(right);

  if (leftMinutes === null && rightMinutes === null) return 0;
  if (leftMinutes === null) return 1;
  if (rightMinutes === null) return -1;
  return rightMinutes - leftMinutes;
}

function toMinutes(time?: string) {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
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

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  padding: 32px 0;
  color: #9ca3af;
  font-size: 14px;
`;

const LoadMoreTrigger = styled.div`
  height: 1px;
`;

const LoadMoreIndicator = styled.div`
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
`;
