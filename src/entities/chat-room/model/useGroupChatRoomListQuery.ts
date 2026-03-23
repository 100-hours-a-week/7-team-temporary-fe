"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchChatRoomList } from "../api";
import { AuthService } from "@/shared/auth";

import { toChatRoomListModel } from "./chatRoomList.mapper";
import { chatRoomQueryKeys } from "./queryKeys";

interface UseGroupChatRoomListQueryOptions {
  page?: number;
  size?: number;
  enabled?: boolean;
  refetchOnMount?: boolean | "always";
  staleTime?: number;
  gcTime?: number;
}

export function useGroupChatRoomListQuery({
  page = 1,
  size = 10,
  enabled = true,
  refetchOnMount,
  staleTime,
  gcTime,
}: UseGroupChatRoomListQueryOptions = {}) {
  return useQuery({
    queryKey: chatRoomQueryKeys.list(page, size),
    queryFn: ({ signal }) =>
      AuthService.refreshAndRetry(() => fetchChatRoomList({ page, size, signal })),
    select: (dto) => toChatRoomListModel(dto),
    enabled,
    refetchOnMount,
    staleTime,
    gcTime,
  });
}
