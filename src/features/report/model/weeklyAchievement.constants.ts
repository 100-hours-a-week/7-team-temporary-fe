import type { WeeklyAchievementPoint } from "./types";

export const DAYS_IN_WEEK = 7;

export const WEEKLY_ACHIEVEMENT_DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export const WEEKLY_ACHIEVEMENT_ZERO: WeeklyAchievementPoint[] = WEEKLY_ACHIEVEMENT_DAY_LABELS.map(
  (day) => ({
    day,
    rate: 0,
  }),
);
