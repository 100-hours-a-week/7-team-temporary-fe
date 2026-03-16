import { queryKeyFactory } from "@/shared/query";

const baseKeys = queryKeyFactory("chat-room");

export const chatRoomQueryKeys = {
  ...baseKeys,
  searchAll: () => baseKeys.by("search"),
  search: (title: string, page: number, size: number) => baseKeys.by("search", title, page, size),
  listAll: () => baseKeys.by("list"),
  list: (page: number, size: number) => baseKeys.by("list", page, size),
  detail: (roomId: number) => baseKeys.by("detail", roomId),
  ownerStatus: (roomId: number, ownerId: number) => baseKeys.by("owner-status", roomId, ownerId),
  messagesInfinite: (roomId: number, size: number, myUserId?: number | null) =>
    baseKeys.by("messages-infinite", roomId, size, myUserId ?? null),
  messages: (roomId: number, cursor?: number, size?: number) =>
    baseKeys.by("messages", roomId, cursor ?? null, size ?? null),
};
