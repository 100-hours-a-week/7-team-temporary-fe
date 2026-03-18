"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib";
import { Icon } from "@/shared/ui/icon";

import type { TaskItemModel } from "../model/taskModels";

interface HomeTaskItemProps {
  task: TaskItemModel;
  onToggleComplete: (taskId: number) => void;
  className?: string;
  style?: CSSProperties;
  variant?: "card" | "list";
  iconClassName?: string;
}

const EMPTY_TIME_TEXT = "시간 정보 없음";

/**
 * 홈 플래너에서 작업을 표현하는 카드 컴포넌트.
 */
export function HomeTaskItem({
  task,
  onToggleComplete,
  className,
  style,
  variant = "card",
  iconClassName,
}: HomeTaskItemProps) {
  const timeValue = getTimeValue(task);
  const [animateComplete, setAnimateComplete] = useState(false);
  const prevCompletedRef = useRef(task.isCompleted);

  useEffect(() => {
    const wasCompleted = prevCompletedRef.current;
    if (!wasCompleted && task.isCompleted) {
      setAnimateComplete(true);
      const timer = window.setTimeout(() => setAnimateComplete(false), 280);
      prevCompletedRef.current = task.isCompleted;
      return () => window.clearTimeout(timer);
    }
    prevCompletedRef.current = task.isCompleted;
  }, [task.isCompleted]);

  return (
    <article
      className={cn(
        "text-ink-900 relative z-[1] flex items-start gap-3",
        variant === "list" ? "border-none bg-transparent pt-[10px] pb-[5px] pl-[5px]" : "bg-white",
        variant === "card" && task.isFixedTime && "border-[#FF6D6D]",
        variant === "card" && task.isCompleted && "text-gray-400",
        className,
      )}
      style={style}
    >
      <div className="flex w-full items-start gap-3">
        <button
          type="button"
          aria-pressed={task.isCompleted}
          aria-label={task.isCompleted ? "완료됨" : "완료"}
          onClick={() => onToggleComplete(task.taskId)}
          className={cn(
            "relative z-[1] shrink-0 cursor-pointer rounded-lg border-none bg-transparent p-0 text-xs font-semibold text-white",
            animateComplete && "home-task-complete-pop-animate",
          )}
        >
          <Icon
            name={task.isCompleted ? "todo_check" : "todo_unchecked"}
            className={cn(
              "h-6 w-6",
              !task.isCompleted && variant === "card" && "text-primary-600",
              iconClassName,
            )}
            aria-hidden
          />
        </button>
        <div className="flex min-w-0 flex-col gap-[7px] leading-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "relative text-base font-semibold no-underline",
                task.isCompleted
                  ? "home-task-title-completed text-gray-400"
                  : variant === "list"
                    ? "text-[#541e0f]"
                    : "",
                task.isCompleted && animateComplete && "home-task-title-strike-animate",
              )}
            >
              {task.title}
            </div>
            {task.isUrgent ? (
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-600">
                중요
              </span>
            ) : null}
          </div>
          <div
            className={cn(
              "flex items-center gap-2 text-[13px]",
              variant === "list" ? "text-[#b8aca4]" : "opacity-70",
            )}
          >
            <span className="font-medium">{timeValue}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function getTimeValue(task: TaskItemModel) {
  if (task.startTime && task.endTime) {
    return `${task.startTime} ~ ${task.endTime}`;
  }

  if (task.timeType === "ESTIMATED") {
    return task.estimatedTimeRange ?? EMPTY_TIME_TEXT;
  }

  return EMPTY_TIME_TEXT;
}
