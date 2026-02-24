import { queryKeyFactory } from "@/shared/query";

import type { ChatRoomType } from "../api";

const baseKeys = queryKeyFactory("chat-room");

export const chatRoomQueryKeys = {
  ...baseKeys,
  listAll: () => baseKeys.by("list"),
  list: (type: ChatRoomType, page: number, size: number) => baseKeys.by("list", type, page, size),
};
