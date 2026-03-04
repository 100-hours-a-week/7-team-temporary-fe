import { queryKeyFactory } from "@/shared/query";

const baseKeys = queryKeyFactory("home");

export const dayPlanPresenceQueryKeys = {
  ...baseKeys,
  dayPlanPeriodSchedules: (startDate: string, endDate: string) =>
    baseKeys.by("day-plan-period-schedules", startDate, endDate),
};
