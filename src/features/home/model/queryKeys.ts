import { queryKeyFactory } from "@/shared/query";

const baseKeys = queryKeyFactory("home");

export const homeQueryKeys = {
  ...baseKeys,
  currentSchedule: () => baseKeys.by("current-schedule"),
  dayPlanSchedule: (date: string, page: number, size: number) =>
    baseKeys.by("day-plan-schedule", date, page, size),
  dayPlanScheduleById: (dayPlanId: number, page: number, size: number) =>
    baseKeys.by("day-plan-schedule-by-id", dayPlanId, page, size),
  dayPlanSchedulesById: (dayPlanId: number, status: string, page: number, size: number) =>
    baseKeys.by("day-plan-schedules-by-id", dayPlanId, status, page, size),
};
