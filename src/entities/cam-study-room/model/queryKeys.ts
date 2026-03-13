import { queryKeyFactory } from "@/shared/query";

const baseKeys = queryKeyFactory("cam-study-room");

export const camStudyRoomQueryKeys = {
  ...baseKeys,
  listAll: () => baseKeys.by("list"),
  list: (page: number, size: number) => baseKeys.by("list", page, size),
};
