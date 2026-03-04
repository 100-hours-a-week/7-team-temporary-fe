import { queryKeyFactory } from "@/shared/query";

const baseKeys = queryKeyFactory("home");

export const dayPlanQueryKeys = {
  ...baseKeys,
  reflectionStatus: (dayPlanId: number) => baseKeys.by("reflection-status", dayPlanId),
};
