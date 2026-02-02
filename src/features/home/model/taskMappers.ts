import type {
  HomeTaskItemModel,
  TaskItemModel,
  TaskTimeType,
  TodoCartTaskItemModel,
} from "./taskModels";

const DEFAULT_ASSIGNED_BY: TaskItemModel["assignedBy"] = "USER";

/**
 * 서버 응답 기반 TaskItemModel 공통 매핑 유틸.
 */
export function toTaskItemModelFromHomeTask(task: HomeTaskItemModel): TaskItemModel {
  const assignedBy = task.assignedBy ?? DEFAULT_ASSIGNED_BY;

  return {
    taskId: task.scheduleId,
    title: task.title,
    startTime: task.startAt,
    endTime: task.endAt,
    isCompleted: task.status === "DONE",
    isFixedTime: task.type === "FIXED",
    timeType: getTaskTimeType({ assignedBy, type: task.type }),
    isUrgent: task.isUrgent ?? undefined,
    assignedBy,
  };
}

/**
 * 작업 바구니 TaskItemModel 매핑.
 */
export function toTaskItemModelFromTodoCart(task: TodoCartTaskItemModel): TaskItemModel {
  return {
    taskId: task.scheduleId,
    title: task.title,
    startTime: task.startAt,
    endTime: task.endAt,
    isCompleted: false,
    isFixedTime: task.type === "FIXED",
    timeType: getTaskTimeType({ assignedBy: task.assignedBy, type: task.type }),
    focusLevel: task.focusLevel ?? undefined,
    isUrgent: task.isUrgent ?? undefined,
    estimatedTimeRange: task.estimatedTimeRange ?? undefined,
    assignedBy: task.assignedBy,
  };
}

export function getTaskTimeType({
  assignedBy,
  type,
}: {
  assignedBy: TaskItemModel["assignedBy"];
  type: "FIXED" | "FLEX";
}): TaskTimeType {
  if (assignedBy === "AI") return "ARRANGED";
  return type === "FIXED" ? "FIXED" : "ESTIMATED";
}
