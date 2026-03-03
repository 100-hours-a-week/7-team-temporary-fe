import type { DayPlanPeriodSchedulesResponseDto } from "../api";
import type { DayPlanPeriodSchedulesModel } from "./periodScheduleModels";

export function toDayPlanPeriodSchedulesModel(
  dto: DayPlanPeriodSchedulesResponseDto,
): DayPlanPeriodSchedulesModel {
  return {
    startDate: dto.startDate,
    endDate: dto.endDate,
    days: dto.days.map((day) => ({
      date: day.date,
      hasPlan: day.hasPlan,
    })),
  };
}
