import { queryKeyFactory } from "@/shared/query";

const baseKeys = queryKeyFactory("friend");

export const friendQueryKeys = {
  ...baseKeys,
  listAll: () => baseKeys.by("list"),
  list: (page: number, size: number) => baseKeys.by("list", page, size),
};
