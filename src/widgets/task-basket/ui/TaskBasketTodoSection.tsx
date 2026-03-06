import type { RefObject } from "react";

import { ScheduleTodoList } from "@/entities/day-plan-schedule";
import { Icon } from "@/shared/ui/icon";
import {
  TASK_BASKET_ADD_TASK_ARIA_LABEL,
  TASK_BASKET_TODO_LIST_TITLE,
  TASK_BASKET_WEEKDAY_LABELS,
} from "../model/constants";
import type { TaskBasketTodoTask } from "../model/types";

interface TaskBasketTodoSectionProps {
  contentRef?: RefObject<HTMLDivElement | null>;
  selectedDate: Date;
  tasks: TaskBasketTodoTask[];
  onOpenSheet: () => void;
  onEditTask: (task: TaskBasketTodoTask) => void;
  onDeleteTask: (scheduleId: number) => void;
  hasMore: boolean;
  isFetchingMore: boolean;
  onLoadMore: () => void;
  scrollRootRef: RefObject<HTMLElement | null>;
}

export function TaskBasketTodoSection({
  contentRef,
  selectedDate,
  tasks,
  onOpenSheet,
  onEditTask,
  onDeleteTask,
  hasMore,
  isFetchingMore,
  onLoadMore,
  scrollRootRef,
}: TaskBasketTodoSectionProps) {
  return (
    <div
      ref={contentRef}
      className="px-6 pt-[13px] pb-32"
    >
      <div className="text-[18px] font-bold text-neutral-900">
        {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일{" "}
        {TASK_BASKET_WEEKDAY_LABELS[selectedDate.getDay()]}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-[18px] font-medium text-neutral-900">
          {TASK_BASKET_TODO_LIST_TITLE}
        </div>
        <button
          type="button"
          className="text-primary-400 flex h-11 w-11 items-center justify-center rounded-xl text-2xl"
          aria-label={TASK_BASKET_ADD_TASK_ARIA_LABEL}
          onClick={onOpenSheet}
        >
          <Icon
            name="calendar_plus"
            className="h-6 w-6"
            aria-hidden
          />
        </button>
      </div>
      <div className="mt-3">
        <ScheduleTodoList
          tasks={tasks}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          hasMore={hasMore}
          isFetchingMore={isFetchingMore}
          onLoadMore={onLoadMore}
          scrollRootRef={scrollRootRef}
        />
      </div>
    </div>
  );
}
