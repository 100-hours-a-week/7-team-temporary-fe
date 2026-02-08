import { queryKeyFactory } from "@/shared/query";

const baseKeys = queryKeyFactory("home");

export const dayPlanQueryKeys = {
  ...baseKeys,
  currentSchedule: () => baseKeys.by("current-schedule"),
  dayPlanSchedule: (date: string, page: number, size: number) =>
    baseKeys.by("day-plan-schedule", date, page, size),
  dayPlanScheduleById: (dayPlanId: number, page: number, size: number) =>
    baseKeys.by("day-plan-schedule-by-id", dayPlanId, page, size),
  dayPlanSchedulesById: (dayPlanId: number, status: string, page: number, size: number) =>
    baseKeys.by("day-plan-schedules-by-id", dayPlanId, status, page, size),
  dayPlanScheduleCacheKeys: ({
    dayPlanId,
    dayPlanDate,
    page = 1,
    size = 10,
  }: {
    dayPlanId?: number | null;
    dayPlanDate?: string | null;
    page?: number;
    size?: number;
  }) => {
    const keys: Array<readonly unknown[]> = [];
    if (dayPlanId) {
      keys.push(baseKeys.by("day-plan-schedule-by-id", dayPlanId, page, size));
    }
    if (dayPlanDate) {
      keys.push(baseKeys.by("day-plan-schedule", dayPlanDate, page, size));
    }
    return keys;
  },
};
