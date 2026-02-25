"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  type FriendListItemVM,
  useCreateFriendRequestMutation,
  useFriendSearchQuery,
  useFriendsQuery,
} from "@/entities/friend";
import { useToast } from "@/shared/ui/toast";

const FRIEND_SEARCH_PAGE = 1;
const FRIEND_SEARCH_SIZE = 10;
const FRIEND_EXISTENCE_CHECK_PAGE = 1;
const FRIEND_EXISTENCE_CHECK_SIZE = 100;

interface UseFriendSearchSectionOptions {
  enabled?: boolean;
}

export interface FriendSearchResultVM extends FriendListItemVM {
  isRequested: boolean;
}

const FRIEND_REQUEST_SUCCESS_MESSAGE = "친구 요청을 성공적으로 보냈습니다.";
const FRIEND_REQUEST_FAILURE_MESSAGE = "친구 요청 전송에 실패했습니다. 잠시 후 다시 시도해주세요.";

export function useFriendSearchSection({ enabled = true }: UseFriendSearchSectionOptions = {}) {
  const { showToast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(FRIEND_SEARCH_PAGE);
  const [fetchedFriends, setFetchedFriends] = useState<FriendListItemVM[]>([]);
  const [requestedFriendIds, setRequestedFriendIds] = useState<Set<number>>(new Set());
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const normalizedKeyword = keyword.trim();
  const shouldSearch = normalizedKeyword.length > 0;
  const createFriendRequestMutation = useCreateFriendRequestMutation();

  const friendSearchQuery = useFriendSearchQuery({
    nickname: normalizedKeyword,
    page: currentPage,
    size: FRIEND_SEARCH_SIZE,
    enabled: enabled && shouldSearch,
  });

  const friendsQuery = useFriendsQuery({
    page: FRIEND_EXISTENCE_CHECK_PAGE,
    size: FRIEND_EXISTENCE_CHECK_SIZE,
    enabled: enabled && shouldSearch,
  });

  const existingFriendIdSet = useMemo(
    () => new Set((friendsQuery.data?.content ?? []).map((friend) => friend.id)),
    [friendsQuery.data?.content],
  );

  useEffect(() => {
    setCurrentPage(FRIEND_SEARCH_PAGE);
    setFetchedFriends([]);
    setTotalPages(null);
    setRequestedFriendIds(new Set());
  }, [normalizedKeyword]);

  useEffect(() => {
    if (!shouldSearch) return;
    if (!friendSearchQuery.data) return;

    setTotalPages(friendSearchQuery.data.totalPages);
    setFetchedFriends((prev) => {
      const base = currentPage === FRIEND_SEARCH_PAGE ? [] : prev;
      const merged = new Map(base.map((item) => [item.id, item]));
      friendSearchQuery.data.content.forEach((item) => merged.set(item.id, item));

      return Array.from(merged.values()).sort((a, b) => a.nickname.localeCompare(b.nickname, "ko"));
    });
  }, [currentPage, friendSearchQuery.data, shouldSearch]);

  const hasMore =
    totalPages === null
      ? (friendSearchQuery.data?.content.length ?? 0) === FRIEND_SEARCH_SIZE
      : currentPage < totalPages;

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
        isFriend: friend.isFriend || existingFriendIdSet.has(friend.id),
        isRequested: requestedFriendIds.has(friend.id),
      })),
    [existingFriendIdSet, fetchedFriends, requestedFriendIds],
  );

  const requestFriend = useCallback(
    (targetUserId: number) => {
      if (createFriendRequestMutation.isPending) return;
      if (existingFriendIdSet.has(targetUserId)) return;
      if (requestedFriendIds.has(targetUserId)) return;

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
    [createFriendRequestMutation, existingFriendIdSet, requestedFriendIds, showToast],
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
    isLoading: enabled && shouldSearch && friendSearchQuery.isLoading,
    isError: enabled && shouldSearch && friendSearchQuery.isError,
    isFetching: enabled && shouldSearch && friendSearchQuery.isFetching,
    hasMore: enabled && shouldSearch && hasMore,
    loadMore,
  };
}
