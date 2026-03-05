"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { type FriendListItemVM, useFriendsQuery } from "@/entities/friend";

import { FRIEND_LIST_PAGE, FRIEND_LIST_SIZE } from "./constants";

export function useFriendListData() {
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

  const removeFriend = useCallback((friendUserId: number) => {
    setFetchedFriends((prev) => prev.filter((friend) => friend.id !== friendUserId));
  }, []);

  const prependFriend = useCallback((friend: FriendListItemVM) => {
    setFetchedFriends((prev) => {
      if (prev.some((item) => item.id === friend.id)) return prev;
      return [friend, ...prev];
    });
  }, []);

  return {
    friends: useMemo(() => fetchedFriends, [fetchedFriends]),
    hasMore,
    loadMore,
    removeFriend,
    prependFriend,
    isInitialLoading: friendsQuery.isLoading && fetchedFriends.length === 0,
    isError: friendsQuery.isError,
    isFetching: friendsQuery.isFetching,
  };
}
