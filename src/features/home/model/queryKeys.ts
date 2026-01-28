import { queryKeyFactory } from "@/shared/query";

const baseKeys = queryKeyFactory("home");

export const homeQueryKeys = {
  ...baseKeys,
  dayPlanSchedule: (date: string, page: number, size: number) =>
    baseKeys.by("day-plan-schedule", date, page, size),
};
