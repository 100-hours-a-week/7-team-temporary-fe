import { queryKeyFactory } from "@/shared/query";

const baseKeys = queryKeyFactory("retro");

export const retroQueryKeys = {
  ...baseKeys,
  myListAll: () => baseKeys.by("my-list"),
  myList: (page: number, size: number) => baseKeys.by("my-list", page, size),
};
