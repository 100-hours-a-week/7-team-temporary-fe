"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { type FriendListItemVM, useFriendSearchQuery } from "@/entities/friend";

const FRIEND_SEARCH_PAGE = 1;
const FRIEND_SEARCH_SIZE = 10;

export function useFriendSearchSection() {
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(FRIEND_SEARCH_PAGE);
  const [fetchedFriends, setFetchedFriends] = useState<FriendListItemVM[]>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const normalizedKeyword = keyword.trim();
  const shouldSearch = normalizedKeyword.length > 0;

  const friendSearchQuery = useFriendSearchQuery({
    nickname: normalizedKeyword,
    page: currentPage,
    size: FRIEND_SEARCH_SIZE,
    enabled: shouldSearch,
  });

  useEffect(() => {
    setCurrentPage(FRIEND_SEARCH_PAGE);
    setFetchedFriends([]);
    setTotalPages(null);
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
    if (!shouldSearch) return;
    if (!hasMore) return;
    if (friendSearchQuery.isFetching) return;
    setCurrentPage((prev) => prev + 1);
  }, [friendSearchQuery.isFetching, hasMore, shouldSearch]);

  return {
    keyword,
    setKeyword,
    shouldSearch,
    friends: useMemo(() => fetchedFriends, [fetchedFriends]),
    isLoading: shouldSearch && friendSearchQuery.isLoading,
    isError: shouldSearch && friendSearchQuery.isError,
    isFetching: shouldSearch && friendSearchQuery.isFetching,
    hasMore: shouldSearch && hasMore,
    loadMore,
  };
}
