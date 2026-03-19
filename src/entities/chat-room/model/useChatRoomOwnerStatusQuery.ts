"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchChatRoomOwnerStatus } from "../api";

import { chatRoomQueryKeys } from "./queryKeys";

interface UseChatRoomOwnerStatusQueryOptions {
  roomId: number;
  ownerId?: number | null;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useChatRoomOwnerStatusQuery({
  roomId,
  ownerId,
  enabled = true,
  staleTime,
  gcTime,
}: UseChatRoomOwnerStatusQueryOptions) {
  return useQuery({
    queryKey: chatRoomQueryKeys.ownerStatus(roomId, ownerId ?? -1),
    queryFn: ({ signal }) =>
      fetchChatRoomOwnerStatus({
        roomId,
        ownerId: ownerId as number,
        signal,
      }),
    enabled: enabled && Number.isFinite(roomId) && Number.isFinite(ownerId),
    staleTime,
    gcTime,
  });
}
