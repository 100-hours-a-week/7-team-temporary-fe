import { queryKeyFactory } from "@/shared/query";

import type { ChatRoomType } from "../api";

const baseKeys = queryKeyFactory("chat-room");

export const chatRoomQueryKeys = {
  ...baseKeys,
  searchAll: () => baseKeys.by("search"),
  search: (title: string, page: number, size: number) => baseKeys.by("search", title, page, size),
  listAll: () => baseKeys.by("list"),
  list: (type: ChatRoomType, page: number, size: number) => baseKeys.by("list", type, page, size),
  detail: (roomId: number) => baseKeys.by("detail", roomId),
  ownerStatus: (ownerId: number) => baseKeys.by("owner-status", ownerId),
  messagesInfinite: (roomId: number, size: number, myUserId?: number | null) =>
    baseKeys.by("messages-infinite", roomId, size, myUserId ?? null),
  messages: (roomId: number, cursor?: number, size?: number) =>
    baseKeys.by("messages", roomId, cursor ?? null, size ?? null),
};
