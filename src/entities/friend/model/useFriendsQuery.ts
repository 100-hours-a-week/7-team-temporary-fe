import { useQuery } from "@tanstack/react-query";

import { fetchFriends } from "../api";

import { toFriendListModel } from "./mappers";
import { friendQueryKeys } from "./queryKeys";

interface UseFriendsQueryOptions {
  page?: number;
  size?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useFriendsQuery({
  page = 1,
  size = 10,
  enabled = true,
  staleTime,
  gcTime,
}: UseFriendsQueryOptions = {}) {
  return useQuery({
    queryKey: friendQueryKeys.list(page, size),
    queryFn: ({ signal }) => fetchFriends({ page, size, signal }),
    select: toFriendListModel,
    enabled,
    staleTime,
    gcTime,
  });
}
