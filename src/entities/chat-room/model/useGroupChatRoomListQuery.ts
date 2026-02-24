import { useQuery } from "@tanstack/react-query";

import { fetchChatRoomList, CHAT_ROOM_REALTIME_MOCK_ENABLED, MOCK_REALTIME_STATE } from "../api";

import { toChatRoomListModel } from "./chatRoomList.mapper";
import { chatRoomQueryKeys } from "./queryKeys";

interface UseGroupChatRoomListQueryOptions {
  page?: number;
  size?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useGroupChatRoomListQuery({
  page = 1,
  size = 10,
  enabled = true,
  staleTime,
  gcTime,
}: UseGroupChatRoomListQueryOptions = {}) {
  return useQuery({
    queryKey: chatRoomQueryKeys.list("OPEN_CHAT", page, size),
    queryFn: ({ signal }) => fetchChatRoomList({ type: "OPEN_CHAT", page, size, signal }),
    select: (dto) =>
      toChatRoomListModel(dto, CHAT_ROOM_REALTIME_MOCK_ENABLED ? MOCK_REALTIME_STATE : undefined),
    enabled,
    staleTime,
    gcTime,
  });
}
