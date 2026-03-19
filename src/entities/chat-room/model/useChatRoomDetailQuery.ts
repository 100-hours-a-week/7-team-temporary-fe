"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchChatRoomDetail } from "../api";

import { toChatRoomDetailModel } from "./chatRoomDetail.mapper";
import { chatRoomQueryKeys } from "./queryKeys";

interface UseChatRoomDetailQueryOptions {
  roomId: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useChatRoomDetailQuery({
  roomId,
  enabled = true,
  staleTime = 30_000,
  gcTime,
}: UseChatRoomDetailQueryOptions) {
  return useQuery({
    queryKey: chatRoomQueryKeys.detail(roomId),
    queryFn: ({ signal }) => fetchChatRoomDetail({ roomId, signal }),
    select: toChatRoomDetailModel,
    enabled: enabled && roomId > 0,
    staleTime,
    gcTime,
  });
}
