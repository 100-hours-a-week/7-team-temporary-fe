import { useQuery } from "@tanstack/react-query";

import { fetchChatRoomOwnerStatus } from "../api";

import { chatRoomQueryKeys } from "./queryKeys";

interface UseChatRoomOwnerStatusQueryOptions {
  ownerId: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useChatRoomOwnerStatusQuery({
  ownerId,
  enabled = true,
  staleTime,
  gcTime,
}: UseChatRoomOwnerStatusQueryOptions) {
  return useQuery({
    queryKey: chatRoomQueryKeys.ownerStatus(ownerId),
    queryFn: ({ signal }) => fetchChatRoomOwnerStatus({ ownerId, signal }),
    enabled: enabled && Number.isFinite(ownerId),
    staleTime,
    gcTime,
  });
}
