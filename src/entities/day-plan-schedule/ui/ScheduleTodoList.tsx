import styled from "@emotion/styled";
import type { RefObject } from "react";

import { useInfiniteScrollTrigger } from "@/shared/hooks";
import { parseHHmmToMinutes } from "@/shared/lib";
import type { TodoCartTaskItemModel } from "../model/taskModels";
import { TodoCartTaskItem, type TodoCartViewMode } from "./TodoCartTaskItem";

export type ScheduleTodoListTask = TodoCartTaskItemModel & { status?: "TODO" | "DONE" };

export interface ScheduleTodoListProps {
  tasks: ScheduleTodoListTask[];
  onEdit: (task: ScheduleTodoListTask) => void;
  onDelete: (scheduleId: number) => void;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  onLoadMore?: () => void;
  scrollRootRef?: RefObject<HTMLElement | null>;
}

const EMPTY_TEXT = "작성된 할 일이 없습니다.";

export function ScheduleTodoList({
  tasks,
  onEdit,
  onDelete,
  hasMore = false,
  isFetchingMore = false,
  onLoadMore,
  scrollRootRef,
}: ScheduleTodoListProps) {
  const { loadMoreRef } = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled: Boolean(onLoadMore),
    hasMore,
    isFetching: isFetchingMore,
    onLoadMore: () => onLoadMore?.(),
    rootRef: scrollRootRef,
  });

  const visibleTasks = tasks
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
          onEdit={(item) => onEdit(item as ScheduleTodoListTask)}
          onDelete={onDelete}
        />
      ))}
      {onLoadMore ? (
        <>
          <LoadMoreTrigger ref={loadMoreRef} />
          {isFetchingMore && hasMore ? <LoadMoreIndicator>불러오는 중...</LoadMoreIndicator> : null}
        </>
      ) : null}
    </ListContainer>
  );
}

function getViewMode(task: ScheduleTodoListTask): TodoCartViewMode {
  if (task.assignmentStatus === "ASSIGNED") {
    return "ARRANGED";
  }
  return "UNASSIGNED";
}

function sortByStartTimeDesc(left?: string, right?: string) {
  const leftMinutes = parseHHmmToMinutes(left);
  const rightMinutes = parseHHmmToMinutes(right);

  if (leftMinutes === null && rightMinutes === null) return 0;
  if (leftMinutes === null) return 1;
  if (rightMinutes === null) return -1;
  return rightMinutes - leftMinutes;
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
