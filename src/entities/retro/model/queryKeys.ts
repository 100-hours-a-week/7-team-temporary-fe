import { queryKeyFactory } from "@/shared/query";

const baseKeys = queryKeyFactory("retro");

export const retroQueryKeys = {
  ...baseKeys,
  myListAll: () => baseKeys.by("my-list"),
  myList: (page: number, size: number) => baseKeys.by("my-list", page, size),
  publicListAll: () => baseKeys.by("public-list"),
  publicList: (isOpen: boolean, page: number, size: number) =>
    baseKeys.by("public-list", isOpen, page, size),
};
