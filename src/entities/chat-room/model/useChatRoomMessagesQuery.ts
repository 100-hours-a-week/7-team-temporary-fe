import { useQuery } from "@tanstack/react-query";

import { fetchChatRoomMessages } from "../api";

import { toChatMessageListModel } from "./chatMessage.mapper";
import { chatRoomQueryKeys } from "./queryKeys";

const DEFAULT_CHAT_ROOM_SIZE = 50;
const DEFAULT_CHAT_ROOM_MY_USER_ID = 3;

interface UseChatRoomMessagesQueryOptions {
  roomId: number;
  cursor?: number;
  size?: number;
  myUserId?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useChatRoomMessagesQuery({
  roomId,
  cursor,
  size = DEFAULT_CHAT_ROOM_SIZE,
  myUserId = DEFAULT_CHAT_ROOM_MY_USER_ID,
  enabled = true,
  staleTime,
  gcTime,
}: UseChatRoomMessagesQueryOptions) {
  return useQuery({
    queryKey: chatRoomQueryKeys.messages(roomId, cursor, size),
    queryFn: ({ signal }) => fetchChatRoomMessages({ roomId, cursor, size, signal }),
    select: (dto) => toChatMessageListModel(dto, { myUserId }),
    enabled: enabled && roomId > 0,
    staleTime,
    gcTime,
  });
}
