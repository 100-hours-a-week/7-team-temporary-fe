import { useQuery } from "@tanstack/react-query";

import { fetchChatRoomSearchList } from "../api";

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
  // TODO: 개인 채팅방 목록 API 전까지 검색 API를 임시 목록 소스로 사용한다.
  return useQuery({
    queryKey: chatRoomQueryKeys.search("", page, size),
    queryFn: ({ signal }) => fetchChatRoomSearchList({ title: "", page, size, signal }),
    select: (dto) => toChatRoomListModel(dto),
    enabled,
    staleTime,
    gcTime,
  });
}
