"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { type FriendListItemVM, useFriendsQuery } from "@/entities/friend";

const FRIEND_LIST_PAGE = 1;
const FRIEND_LIST_SIZE = 10;

export function useFriendListSection() {
  const [currentPage, setCurrentPage] = useState(FRIEND_LIST_PAGE);
  const [fetchedFriends, setFetchedFriends] = useState<FriendListItemVM[]>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const friendsQuery = useFriendsQuery({
    page: currentPage,
    size: FRIEND_LIST_SIZE,
  });

  useEffect(() => {
    if (!friendsQuery.data) return;

    setTotalPages(friendsQuery.data.totalPages);
    setFetchedFriends((prev) => {
      const base = currentPage === FRIEND_LIST_PAGE ? [] : prev;
      const merged = new Map(base.map((item) => [item.id, item]));
      friendsQuery.data.content.forEach((item) => merged.set(item.id, item));
      return Array.from(merged.values());
    });
  }, [currentPage, friendsQuery.data]);

  const hasMore =
    totalPages === null
      ? (friendsQuery.data?.content.length ?? 0) === FRIEND_LIST_SIZE
      : currentPage < totalPages;

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    if (friendsQuery.isFetching) return;
    setCurrentPage((prev) => prev + 1);
  }, [friendsQuery.isFetching, hasMore]);

  const friends = useMemo(() => fetchedFriends, [fetchedFriends]);

  return {
    friends,
    isLoading: friendsQuery.isLoading,
    isError: friendsQuery.isError,
    isFetching: friendsQuery.isFetching,
    hasMore,
    loadMore,
  };
}
