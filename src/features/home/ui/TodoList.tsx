import styled from "@emotion/styled";

import { useMemo } from "react";

import type { TodoCartTaskItemModel } from "../model/taskModels";
import { useDayPlanScheduleByIdQuery } from "../model/useDayPlanScheduleByIdQuery";
import { TodoCartTaskItem } from "./TodoCartTaskItem";

type TodoListTask = TodoCartTaskItemModel & { status?: "TODO" | "DONE" };

interface TodoListProps {
  tasks: TodoListTask[];
  onEdit: (task: TodoListTask) => void;
  onDelete: (scheduleId: number) => void;
  dayPlanId?: number | null;
  page?: number;
  size?: number;
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
}: TodoListProps) {
  const shouldFetch = Boolean(dayPlanId);
  const { data } = useDayPlanScheduleByIdQuery({
    dayPlanId: dayPlanId ?? 0,
    page,
    size,
    enabled: shouldFetch,
  });

  const fetchedTasks = useMemo(
    () =>
      data?.content.map((item) => ({
        scheduleId: item.scheduleId,
        title: item.title,
        type: item.type,
        startAt: item.startAt,
        endAt: item.endAt,
        estimatedTimeRange: item.estimatedTimeRange,
        focusLevel: item.focusLevel,
        isUrgent: item.isUrgent,
        assignedBy: item.assignedBy,
        status: item.status,
      })) ?? [],
    [data],
  );

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
          viewMode="UNASSIGNED"
          onEdit={(item) => onEdit(item as TodoListTask)}
          onDelete={onDelete}
        />
      ))}
    </ListContainer>
  );
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

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 60vh;
  overflow-y: auto;
`;

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  padding: 32px 0;
  color: #9ca3af;
  font-size: 14px;
`;
