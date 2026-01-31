import { queryKeyFactory } from "@/shared/query";

const baseKeys = queryKeyFactory("notification");

export const notificationQueryKeys = {
  ...baseKeys,
  list: (page: number, size: number) => baseKeys.by("list", page, size),
};
