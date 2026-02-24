"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  FRIEND_REQUEST_MOCKS,
  type FriendListItemVM,
  type FriendRequestItemVM,
  useDeleteFriendMutation,
  useDeleteFriendRequestMutation,
  useFriendsQuery,
} from "@/entities/friend";

const FRIEND_LIST_PAGE = 1;
const FRIEND_LIST_SIZE = 10;

export function useFriendListSection() {
  const [currentPage, setCurrentPage] = useState(FRIEND_LIST_PAGE);
  const [fetchedFriends, setFetchedFriends] = useState<FriendListItemVM[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequestItemVM[]>(() =>
    [...FRIEND_REQUEST_MOCKS].sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
    ),
  );
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const deleteFriendMutation = useDeleteFriendMutation();
  const deleteFriendRequestMutation = useDeleteFriendRequestMutation();

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
  const handleDeleteFriend = useCallback(
    (friendUserId: number) => {
      if (deleteFriendMutation.isPending) return;

      deleteFriendMutation.mutate(friendUserId, {
        onSuccess: () => {
          setFetchedFriends((prev) => prev.filter((friend) => friend.id !== friendUserId));
        },
      });
    },
    [deleteFriendMutation],
  );

  const handleRejectFriendRequest = useCallback(
    (requestId: number) => {
      if (deleteFriendRequestMutation.isPending) return;

      deleteFriendRequestMutation.mutate(requestId, {
        onSuccess: () => {
          setFriendRequests((prev) => prev.filter((request) => request.requestId !== requestId));
        },
      });
    },
    [deleteFriendRequestMutation],
  );

  return {
    friendRequests,
    rejectFriendRequest: handleRejectFriendRequest,
    rejectingRequestId: deleteFriendRequestMutation.isPending
      ? deleteFriendRequestMutation.variables
      : null,
    friends,
    deleteFriend: handleDeleteFriend,
    deletingFriendId: deleteFriendMutation.isPending ? deleteFriendMutation.variables : null,
    isLoading: friendsQuery.isLoading,
    isError: friendsQuery.isError,
    isFetching: friendsQuery.isFetching,
    hasMore,
    loadMore,
  };
}
