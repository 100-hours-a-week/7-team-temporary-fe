import { useQuery } from "@tanstack/react-query";

import { fetchFriendSearchByNickname } from "../api";

import { toFriendSearchModel } from "./mappers";
import { friendQueryKeys } from "./queryKeys";

interface UseFriendSearchQueryOptions {
  nickname: string;
  page?: number;
  size?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useFriendSearchQuery({
  nickname,
  page = 1,
  size = 10,
  enabled = true,
  staleTime,
  gcTime,
}: UseFriendSearchQueryOptions) {
  return useQuery({
    queryKey: friendQueryKeys.search(nickname, page, size),
    queryFn: ({ signal }) => fetchFriendSearchByNickname({ nickname, page, size, signal }),
    select: toFriendSearchModel,
    enabled,
    staleTime,
    gcTime,
  });
}
