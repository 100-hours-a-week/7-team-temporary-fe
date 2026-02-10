import type { DayPlanScheduleResponseDto, EditableTaskItemModel } from "@/entities/day-plan";

export function updateScheduleCache(
  prev: DayPlanScheduleResponseDto | undefined,
  scheduleId: number,
  startAt: string,
  endAt: string,
  task: EditableTaskItemModel,
) {
  if (!prev) return prev;
  const exists = prev.content.some((item) => item.scheduleId === scheduleId);
  const nextContent = exists
    ? prev.content.map((item) =>
        item.scheduleId === scheduleId
          ? {
              ...item,
              title: task.title,
              type: task.type ?? item.type,
              startAt,
              endAt,
              estimatedTimeRange: task.estimatedTimeRange ?? item.estimatedTimeRange,
              focusLevel: task.focusLevel ?? item.focusLevel,
              isUrgent: task.isUrgent ?? item.isUrgent,
              assignedBy: task.assignedBy ?? item.assignedBy,
              status: task.status ?? item.status,
              assignmentStatus: task.assignmentStatus ?? item.assignmentStatus,
            }
          : item,
      )
    : [
        ...prev.content,
        {
          scheduleId,
          parentTitle: null,
          title: task.title,
          status: task.status,
          type: task.type,
          assignedBy: task.assignedBy,
          assignmentStatus: task.assignmentStatus,
          startAt,
          endAt,
          estimatedTimeRange: task.estimatedTimeRange ?? null,
          focusLevel: task.focusLevel ?? null,
          isUrgent: task.isUrgent ?? false,
        },
      ];
  return {
    ...prev,
    content: nextContent,
  };
}

export function removeScheduleCache(
  prev: DayPlanScheduleResponseDto | undefined,
  scheduleId: number,
) {
  if (!prev) return prev;
  return {
    ...prev,
    content: prev.content.filter((item) => item.scheduleId !== scheduleId),
  };
}
