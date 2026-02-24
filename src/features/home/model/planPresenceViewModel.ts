import type { DayPlanPeriodSchedulesModel } from "@/entities/day-plan";

export interface HomeWeekPlanPresenceVM {
  hasPlanByDate: Map<string, boolean>;
}

interface ToHomeWeekPlanPresenceVMParams {
  weekDates: string[];
  periodSchedules?: DayPlanPeriodSchedulesModel;
  selectedDate: string;
  selectedDateHasPlan?: boolean;
}

export function toHomeWeekPlanPresenceVM({
  weekDates,
  periodSchedules,
  selectedDate,
  selectedDateHasPlan,
}: ToHomeWeekPlanPresenceVMParams): HomeWeekPlanPresenceVM {
  const hasPlanByDate = new Map<string, boolean>();

  weekDates.forEach((date) => {
    hasPlanByDate.set(date, false);
  });

  periodSchedules?.days.forEach((day) => {
    if (hasPlanByDate.has(day.date)) {
      hasPlanByDate.set(day.date, day.hasPlan);
    }
  });

  if (selectedDateHasPlan !== undefined) {
    hasPlanByDate.set(selectedDate, selectedDateHasPlan);
  }

  return { hasPlanByDate };
}
