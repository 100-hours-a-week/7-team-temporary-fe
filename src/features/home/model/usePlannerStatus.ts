import { useMemo } from "react";

import type { TaskItemModel } from "@/entities/day-plan-schedule";
import { formatScheduleLabel } from "./date";

interface PlannerStatusMessage {
  text: string;
  className: string;
}

interface UsePlannerStatusParams {
  isError: boolean;
  isLoading: boolean;
  tasks: TaskItemModel[];
  currentTask: TaskItemModel | null;
  isCurrentTaskLoading: boolean;
  isCurrentTaskError: boolean;
  selectedDate: Date;
}

interface UsePlannerStatusResult {
  statusMessage: PlannerStatusMessage | null;
  currentTaskStatus: PlannerStatusMessage | null;
  todayScheduleLabel: string;
}

export function usePlannerStatus({
  isError,
  isLoading,
  tasks,
  currentTask,
  isCurrentTaskLoading,
  isCurrentTaskError,
  selectedDate,
}: UsePlannerStatusParams): UsePlannerStatusResult {
  /*
   * 상태 메시지/표시 텍스트 파생 로직을 분리해 렌더 의존성을 줄인다.
   */
  const statusMessage = useMemo(() => {
    if (isError) return { text: "일정을 불러오지 못했습니다.", className: "text-red-500" };
    if (!isLoading && tasks.length === 0) {
      return { text: "등록된 일정이 없습니다.", className: "text-neutral-500" };
    }
    return null;
  }, [isError, isLoading, tasks.length]);

  const currentTaskStatus = useMemo(() => {
    if (isCurrentTaskError) {
      return { text: "지금 할 일을 불러오지 못했습니다.", className: "text-red-500" };
    }
    if (!isCurrentTaskLoading && !currentTask) {
      return { text: "지금 할 일이 없습니다.", className: "text-neutral-500" };
    }
    return null;
  }, [currentTask, isCurrentTaskError, isCurrentTaskLoading]);

  const todayScheduleLabel = useMemo(() => formatScheduleLabel(selectedDate), [selectedDate]);

  return {
    statusMessage,
    currentTaskStatus,
    todayScheduleLabel,
  };
}
