import type { DayPlanScheduleModel } from "./scheduleModels";

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
  assignedBy?: DayPlanScheduleModel["assignedBy"];
}

export type EditableTaskItemModel = DayPlanScheduleModel;

/*
 * 제외 목록(Excluded) 렌더링용 모델.
 * 식별/상태/시간 범위에 집중한다.
 */
export type ExcludedTaskItemModel = Pick<
  DayPlanScheduleModel,
  "scheduleId" | "title" | "assignmentStatus" | "startAt" | "endAt"
>;

/*
 * TaskBasket(또는 todo cart) 아이템 모델.
 * 추정 시간, 집중도, 긴급도, 배정 정보를 포함한다.
 */
export type TodoCartTaskItemModel = Pick<
  DayPlanScheduleModel,
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
  assignmentStatus?: DayPlanScheduleModel["assignmentStatus"];
};
