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

export interface DayPlanScheduleResponseDto {
  dayPlanId: number;
  content: DayPlanScheduleItemDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
