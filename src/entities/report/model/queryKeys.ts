import { queryKeyFactory } from "@/shared/query";

const baseKeys = queryKeyFactory("report");

export const reportQueryKeys = {
  ...baseKeys,
  weekly: (startDate: string) => baseKeys.by("weekly", startDate),
  messagesAll: (reportId: number) => baseKeys.by("messages", reportId),
  messagesInfinite: (reportId: number, size: number) => baseKeys.by("messages", reportId, size),
};
