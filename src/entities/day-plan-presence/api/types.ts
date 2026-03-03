export interface DayPlanPeriodScheduleItemDto {
  date: string;
  hasPlan: boolean;
}

export interface DayPlanPeriodSchedulesResponseDto {
  startDate: string;
  endDate: string;
  days: DayPlanPeriodScheduleItemDto[];
}
