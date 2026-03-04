export interface DayPlanScheduleItemDto {
  scheduleId: number;
  parentTitle: string | null;
  title: string;
  status: DayPlanScheduleStatus;
  type: DayPlanScheduleType;
  assignedBy: DayPlanScheduleAssignedBy;
  assignmentStatus: DayPlanScheduleAssignmentStatus;
  startAt: string;
  endAt: string;
  estimatedTimeRange: string | null;
  focusLevel: number | null;
  isUrgent: boolean | null;
}

export type DayPlanScheduleDuration =
  | "MINUTE_UNDER_30"
  | "MINUTE_30_TO_60"
  | "HOUR_1_TO_2"
  | "HOUR_2_TO_4"
  | "HOUR_OVER_4";

export type DayPlanScheduleFilterStatus = "EXCLUDED" | "ASSIGNED" | "FIXED";

export type DayPlanScheduleStatus = "TODO" | "DONE";

export type DayPlanScheduleType = "FIXED" | "FLEX";

export type DayPlanScheduleAssignedBy = "USER" | "AI";

export type DayPlanScheduleAssignmentStatus = "ASSIGNED" | "EXCLUDED" | "NOT_ASSIGNED";

export interface CreateDayPlanScheduleRequestDto {
  title: string;
  type: DayPlanScheduleType;
  startAt?: string;
  endAt?: string;
  estimatedTimeRange?: DayPlanScheduleDuration;
  focusLevel?: number;
  isUrgent?: boolean;
}

export interface UpdateDayPlanSchedulePatchRequestDto {
  targetDayPlanId: number;
  startAt: string;
  endAt: string;
}

export interface DayPlanScheduleResponseDto {
  dayPlanId: number;
  aiUsageRemainingCount?: number;
  content: DayPlanScheduleItemDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
