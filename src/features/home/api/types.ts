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

/**
 * @description 일정 조회 응답 타입
 * @property dayPlanId - 일정 ID
 * @property aiUsageRemainingCount - AI 사용 가능 횟수
 * @property content - 일정 목록
 * @property page - 페이지 번호
 * @property size - 페이지 크기
 * @property totalElements - 총 일정 개수
 * @property totalPages - 총 페이지 수
 */
export interface DayPlanScheduleResponseDto {
  dayPlanId: number;
  aiUsageRemainingCount?: number;
  content: DayPlanScheduleItemDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
