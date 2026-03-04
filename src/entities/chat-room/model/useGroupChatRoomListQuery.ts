import { useQuery } from "@tanstack/react-query";

import { fetchChatRoomList } from "../api";
import type { ChatRoomType } from "../api";

import { toChatRoomListModel } from "./chatRoomList.mapper";
import { chatRoomQueryKeys } from "./queryKeys";

interface UseGroupChatRoomListQueryOptions {
  type?: ChatRoomType;
  page?: number;
  size?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useGroupChatRoomListQuery({
  type = "OPEN_CHAT",
  page = 1,
  size = 10,
  enabled = true,
  staleTime,
  gcTime,
}: UseGroupChatRoomListQueryOptions = {}) {
  return useQuery({
    queryKey: chatRoomQueryKeys.list(type, page, size),
    queryFn: ({ signal }) => fetchChatRoomList({ type, page, size, signal }),
    select: (dto) => toChatRoomListModel(dto),
    enabled,
    staleTime,
    gcTime,
  });
}
