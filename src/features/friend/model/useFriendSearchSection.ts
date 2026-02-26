"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  type FriendListItemVM,
  useCreateFriendRequestMutation,
  useFriendSearchQuery,
} from "@/entities/friend";
import { usePaginatedAccumulator } from "@/shared/hooks";
import { useToast } from "@/shared/ui/toast";
import {
  FRIEND_REQUEST_FAILURE_MESSAGE,
  FRIEND_REQUEST_SUCCESS_MESSAGE,
  FRIEND_SEARCH_PAGE,
  FRIEND_SEARCH_SIZE,
} from "./constants";

interface UseFriendSearchSectionOptions {
  enabled?: boolean;
}

export type FriendSearchResultVM = FriendListItemVM;

export function useFriendSearchSection({ enabled = true }: UseFriendSearchSectionOptions = {}) {
  const { showToast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(FRIEND_SEARCH_PAGE);
  const [requestedFriendIds, setRequestedFriendIds] = useState<Set<number>>(new Set());
  const normalizedKeyword = keyword.trim();
  const shouldSearch = normalizedKeyword.length > 0;
  const createFriendRequestMutation = useCreateFriendRequestMutation();

  const friendSearchQuery = useFriendSearchQuery({
    nickname: normalizedKeyword,
    page: currentPage,
    size: FRIEND_SEARCH_SIZE,
    enabled: enabled && shouldSearch,
  });

  const {
    fetchedItems: fetchedFriends,
    hasMore,
    isInitialLoading,
    isFetching,
    isError,
    reset,
  } = usePaginatedAccumulator<FriendListItemVM>({
    data: friendSearchQuery.data,
    isLoading: friendSearchQuery.isLoading,
    isFetching: friendSearchQuery.isFetching,
    isError: friendSearchQuery.isError,
    currentPage,
    initialPage: FRIEND_SEARCH_PAGE,
    pageSize: FRIEND_SEARCH_SIZE,
    getKey: (item) => item.id,
    sort: (a, b) => a.nickname.localeCompare(b.nickname, "ko"),
    enabled: enabled && shouldSearch,
  });

  useEffect(() => {
    setCurrentPage(FRIEND_SEARCH_PAGE);
    setRequestedFriendIds(new Set());
    reset();
  }, [normalizedKeyword, reset]);

  const loadMore = useCallback(() => {
    if (!enabled) return;
    if (!shouldSearch) return;
    if (!hasMore) return;
    if (friendSearchQuery.isFetching) return;
    setCurrentPage((prev) => prev + 1);
  }, [enabled, friendSearchQuery.isFetching, hasMore, shouldSearch]);

  const friends = useMemo<FriendSearchResultVM[]>(
    () =>
      fetchedFriends.map((friend) => ({
        ...friend,
        relationStatus: requestedFriendIds.has(friend.id) ? "PENDING" : friend.relationStatus,
      })),
    [fetchedFriends, requestedFriendIds],
  );

  const requestFriend = useCallback(
    (targetUserId: number) => {
      const targetFriend = friends.find((friend) => friend.id === targetUserId);
      if (!targetFriend) return;

      if (createFriendRequestMutation.isPending) return;
      if (targetFriend.relationStatus !== "NONE") return;

      createFriendRequestMutation.mutate(targetUserId, {
        onSuccess: () => {
          setRequestedFriendIds((prev) => {
            const next = new Set(prev);
            next.add(targetUserId);
            return next;
          });
          showToast(FRIEND_REQUEST_SUCCESS_MESSAGE, "success");
        },
        onError: () => {
          showToast(FRIEND_REQUEST_FAILURE_MESSAGE, "error");
        },
      });
    },
    [createFriendRequestMutation, friends, showToast],
  );

  return {
    keyword,
    setKeyword,
    shouldSearch,
    friends,
    requestFriend,
    requestingFriendId: createFriendRequestMutation.isPending
      ? createFriendRequestMutation.variables
      : null,
    isLoading: isInitialLoading,
    isError,
    isFetching,
    hasMore: enabled && shouldSearch && hasMore,
    loadMore,
  };
}
