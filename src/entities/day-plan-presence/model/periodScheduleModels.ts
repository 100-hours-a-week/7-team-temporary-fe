/**
 * 기간 조회 응답을 도메인 모델로 정규화한 단일 날짜 항목.
 */
export interface DayPlanPeriodScheduleModel {
  date: string;
  hasPlan: boolean;
}

/**
 * 기간 조회 응답을 UI 비의존 도메인 모델로 정규화한 구조.
 */
export interface DayPlanPeriodSchedulesModel {
  startDate: string;
  endDate: string;
  days: DayPlanPeriodScheduleModel[];
}
