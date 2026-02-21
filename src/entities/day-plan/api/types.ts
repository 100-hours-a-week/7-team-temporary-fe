/**
 * DayPlan(하루 계획) 내의 단일 일정/작업 아이템 DTO.
 *
 * 백엔드 응답 그대로를 담는 타입이며, 화면에서 쓰기 좋은 형태로는
 * `src/entities/day-plan/model/taskModels.ts` / `taskMappers.ts`에서 ViewModel로 변환해 사용한다.
 */
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

/**
 * 일정 생성/수정 시 사용하는 “예상 소요 시간” 구간.
 * (백엔드 enum 값을 그대로 사용)
 */
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

/**
 * DayPlan 일정 조회 시 사용하는 필터 상태.
 * (API 스펙 기준)
 */
export type DayPlanScheduleAssignmentStatus = "ASSIGNED" | "EXCLUDED" | "NOT_ASSIGNED";

/**
 * DayPlan에 일정을 추가할 때 사용하는 요청 DTO.
 *
 * - `type`이 FIXED인 경우 보통 `startAt/endAt`가 함께 필요할 수 있다(서버 정책에 따름).
 * - `estimatedTimeRange/focusLevel/isUrgent`는 선택값이며 AI/정렬 로직 등에 사용될 수 있다.
 */
export interface CreateDayPlanScheduleRequestDto {
  title: string;
  type: DayPlanScheduleType;
  startAt?: string;
  endAt?: string;
  estimatedTimeRange?: DayPlanScheduleDuration;
  focusLevel?: number;
  isUrgent?: boolean;
}

/**
 * 일정 시간/소속 DayPlan을 수정하는 PATCH 요청 DTO.
 *
 * 현재 프론트에서는 시간 이동/리사이즈 등에서 사용한다.
 */
export interface UpdateDayPlanSchedulePatchRequestDto {
  targetDayPlanId: number;
  startAt: string;
  endAt: string;
}

/**
 * DayPlan 일정 목록 조회(페이지네이션) 응답 DTO.
 *
 * @property dayPlanId - DayPlan(하루 계획) ID
 * @property aiUsageRemainingCount - (옵션) AI 사용 가능 횟수
 * @property content - 일정 목록
 * @property page - 페이지 번호(1-base 여부는 서버 스펙에 따름)
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

export interface DayPlanPeriodScheduleItemDto {
  date: string;
  hasPlan: boolean;
}

/**
 * 기간 단위 일정 존재 여부 조회 응답 DTO.
 * - API: GET /day-plan/period/schedules
 */
export interface DayPlanPeriodSchedulesResponseDto {
  startDate: string;
  endDate: string;
  days: DayPlanPeriodScheduleItemDto[];
}
