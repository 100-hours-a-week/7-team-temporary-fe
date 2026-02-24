import { queryKeyFactory } from "@/shared/query";

const baseKeys = queryKeyFactory("friend");

export const friendQueryKeys = {
  ...baseKeys,
  listAll: () => baseKeys.by("list"),
  list: (page: number, size: number) => baseKeys.by("list", page, size),
  searchAll: (nickname: string) => baseKeys.by("search", nickname),
  search: (nickname: string, page: number, size: number) =>
    baseKeys.by("search", nickname, page, size),
};
