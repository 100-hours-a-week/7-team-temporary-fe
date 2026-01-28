export interface DayPlanScheduleItemDto {
  scheduleId: number;
  parentTitle: string | null;
  title: string;
  status: "TODO" | "DONE";
  type: "FIXED" | "FLEX";
  assignedBy: "USER" | "AI";
  assignmentStatus: "ASSIGNED" | "EXCLUDED" | "FIXED";
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

export interface CreateDayPlanScheduleRequestDto {
  title: string;
  type: "FIXED" | "FLEX";
  startAt?: string;
  endAt?: string;
  estimatedTimeRange?: DayPlanScheduleDuration;
  focusLevel?: number;
  isUrgent?: boolean;
}

export interface DayPlanScheduleResponseDto {
  dayPlanId: number;
  content: DayPlanScheduleItemDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
