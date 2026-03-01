import { queryKeyFactory } from "@/shared/query";

import type { ChatRoomType } from "../api";

const baseKeys = queryKeyFactory("chat-room");

export const chatRoomQueryKeys = {
  ...baseKeys,
  listAll: () => baseKeys.by("list"),
  list: (type: ChatRoomType, page: number, size: number) => baseKeys.by("list", type, page, size),
  ownerStatus: (ownerId: number) => baseKeys.by("owner-status", ownerId),
  messagesInfinite: (roomId: number, size: number, myUserId: number) =>
    baseKeys.by("messages-infinite", roomId, size, myUserId),
  messages: (roomId: number, cursor?: number, size?: number) =>
    baseKeys.by("messages", roomId, cursor ?? null, size ?? null),
};
