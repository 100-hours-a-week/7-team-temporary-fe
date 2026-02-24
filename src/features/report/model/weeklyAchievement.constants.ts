import type { WeeklyAchievementPoint } from "./types";

export const DAYS_IN_WEEK = 7;

export const WEEKLY_ACHIEVEMENT_MOCK: WeeklyAchievementPoint[] = [
  { day: "월", rate: 80 },
  { day: "화", rate: 46 },
  { day: "수", rate: 82 },
  { day: "목", rate: 22 },
  { day: "금", rate: 40 },
  { day: "토", rate: 40 },
  { day: "일", rate: 72 },
];

export const WEEKLY_ACHIEVEMENT_ZERO: WeeklyAchievementPoint[] = WEEKLY_ACHIEVEMENT_MOCK.map(
  (item) => ({
    ...item,
    rate: 0,
  }),
);
