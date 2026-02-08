import { useEffect, useMemo, useState } from "react";

import type { DayPlanScheduleResponseDto } from "@/entities/day-plan";
import { toTaskItemModelFromHomeTask, type TaskItemModel } from "@/entities/day-plan";

interface UseMergedTasksParams {
  data?: DayPlanScheduleResponseDto;
  currentPage: number;
  pageSize: number;
  overrides: Map<number, boolean>;
  resetKey: string;
}

interface UseMergedTasksResult {
  baseTasks: TaskItemModel[];
  tasks: TaskItemModel[];
  baseCompletionById: Map<number, boolean>;
  hasMore: boolean;
}

/*
 * baseTasks -> fetchedTasks 병합, completionOverrides 합성을 묶어 처리한다.
 * - resetKey가 바뀌면 병합 캐시를 초기화한다.
 * - 파생 상태 계산을 훅 내부로 모아 렌더 의존성을 줄인다.
 */
export function useMergedTasks({
  data,
  currentPage,
  pageSize,
  overrides,
  resetKey,
}: UseMergedTasksParams): UseMergedTasksResult {
  const baseTasks = useMemo(
    () => data?.content.map((task) => toTaskItemModelFromHomeTask(task)) ?? [],
    [data],
  );

  const [fetchedTasks, setFetchedTasks] = useState<TaskItemModel[]>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  useEffect(() => {
    setFetchedTasks([]);
    setTotalPages(null);
  }, [resetKey]);

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
        isCompleted: overrides.get(task.taskId) ?? task.isCompleted,
      })),
    [overrides, fetchedTasks],
  );

  const baseCompletionById = useMemo(
    () => new Map(baseTasks.map((task) => [task.taskId, task.isCompleted])),
    [baseTasks],
  );

  const hasMore = totalPages === null ? baseTasks.length === pageSize : currentPage < totalPages;

  return {
    baseTasks,
    tasks,
    baseCompletionById,
    hasMore,
  };
}
