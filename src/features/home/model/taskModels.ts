export interface PlannerScheduleResponse {
  scheduleId: number;
  title: string;
  status: "TODO" | "DONE";
  type: "FIXED" | "FLEX";
  assignedBy: "USER" | "AI";
  assignmentStatus: "ASSIGNED" | "EXCLUDED";
  startAt: string;
  endAt: string;
  estimatedTimeRange: string | null;
  focusLevel: number | null;
  isUrgent: boolean | null;
}

export type TaskTimeType = "ESTIMATED" | "ARRANGED" | "FIXED";

export interface TaskItemModel {
  taskId: number;
  title: string;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  isFixedTime: boolean;
  timeType: TaskTimeType;
  focusLevel?: number;
  isUrgent?: boolean;
  estimatedTimeRange?: string | null;
  assignedBy?: PlannerScheduleResponse["assignedBy"];
}

export type HomeTaskItemModel = Pick<
  PlannerScheduleResponse,
  "scheduleId" | "title" | "status" | "startAt" | "endAt" | "type" | "isUrgent"
> & {
  assignedBy?: PlannerScheduleResponse["assignedBy"];
};

export type EditableTaskItemModel = PlannerScheduleResponse;

export type ExcludedTaskItemModel = Pick<
  PlannerScheduleResponse,
  "scheduleId" | "title" | "assignmentStatus" | "startAt" | "endAt"
>;

export type TodoCartTaskItemModel = Pick<
  PlannerScheduleResponse,
  | "scheduleId"
  | "title"
  | "type"
  | "startAt"
  | "endAt"
  | "estimatedTimeRange"
  | "focusLevel"
  | "isUrgent"
  | "assignedBy"
>;
