import type {
  DayPlanScheduleAssignedBy,
  DayPlanScheduleAssignmentStatus,
  DayPlanScheduleStatus,
  DayPlanScheduleType,
} from "../api/types";

/*
 * Home/Planner에서 사용하는 스케줄 응답 타입.
 * UI/모델/매퍼 레이어에서 쓰는 API 필드를 그대로 반영한다.
 */
export interface PlannerScheduleResponse {
  scheduleId: number;
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

/*
 * UI/로직에서 시간 의미를 구분하기 위한 타입.
 * ESTIMATED: 추정 시간, ARRANGED: 배치된 시간, FIXED: 고정 시간.
 */
export type TaskTimeType = "ESTIMATED" | "ARRANGED" | "FIXED";

/*
 * 플래너 UI와 드래그/드롭 로직에서 사용하는 정규화된 태스크 모델.
 * 스케줄 응답을 기반으로 UI 친화적 플래그를 추가한다.
 */
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

/*
 * 편집 화면(PlannerEdit)에서 사용하는 전체 스케줄 타입.
 * API 응답 형태를 그대로 사용한다.
 */
export type EditableTaskItemModel = PlannerScheduleResponse;

/*
 * 제외 목록(Excluded) 렌더링용 모델.
 * 식별/상태/시간 범위에 집중한다.
 */
export type ExcludedTaskItemModel = Pick<
  PlannerScheduleResponse,
  "scheduleId" | "title" | "assignmentStatus" | "startAt" | "endAt"
>;

/*
 * TaskBasket(또는 todo cart) 아이템 모델.
 * 추정 시간, 집중도, 긴급도, 배정 정보를 포함한다.
 */
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
> & {
  assignmentStatus?: PlannerScheduleResponse["assignmentStatus"];
};
