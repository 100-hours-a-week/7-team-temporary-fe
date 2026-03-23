"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchChatRoomSearchList } from "../api";
import { AuthService } from "@/shared/auth";

import { toChatRoomSearchListModel } from "./chatRoomSearchList.mapper";
import { chatRoomQueryKeys } from "./queryKeys";

interface UseChatRoomSearchListQueryOptions {
  title?: string;
  page?: number;
  size?: number;
  enabled?: boolean;
  refetchOnMount?: boolean | "always";
  staleTime?: number;
  gcTime?: number;
}

export function useChatRoomSearchListQuery({
  title = "",
  page = 1,
  size = 10,
  enabled = true,
  refetchOnMount,
  staleTime,
  gcTime,
}: UseChatRoomSearchListQueryOptions = {}) {
  return useQuery({
    queryKey: chatRoomQueryKeys.search(title, page, size),
    queryFn: ({ signal }) =>
      AuthService.refreshAndRetry(() => fetchChatRoomSearchList({ title, page, size, signal })),
    select: toChatRoomSearchListModel,
    enabled,
    refetchOnMount,
    staleTime,
    gcTime,
  });
}
