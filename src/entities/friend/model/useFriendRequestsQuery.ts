"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchFriendRequests } from "../api";

import { toFriendRequestListModel } from "./mappers";
import { friendQueryKeys } from "./queryKeys";

interface UseFriendRequestsQueryOptions {
  page?: number;
  size?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useFriendRequestsQuery({
  page = 1,
  size = 10,
  enabled = true,
  staleTime,
  gcTime,
}: UseFriendRequestsQueryOptions = {}) {
  return useQuery({
    queryKey: friendQueryKeys.requestList(page, size),
    queryFn: ({ signal }) => fetchFriendRequests({ page, size, signal }),
    select: toFriendRequestListModel,
    enabled,
    staleTime,
    gcTime,
  });
}
