import { queryKeyFactory } from "@/shared/query";

const baseKeys = queryKeyFactory("report");

export const reportQueryKeys = {
  ...baseKeys,
  weekly: (startDate: string) => baseKeys.by("weekly", startDate),
};
