"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  type FriendListItemVM,
  type FriendRequestItemVM,
  useAcceptFriendRequestMutation,
  useDeleteFriendMutation,
  useDeleteFriendRequestMutation,
  useFriendRequestsQuery,
  useFriendsQuery,
} from "@/entities/friend";
import { useToast } from "@/shared/ui/toast";

import {
  FRIEND_LIST_PAGE,
  FRIEND_LIST_SIZE,
  FRIEND_REQUEST_ACCEPT_FAILURE_MESSAGE,
  FRIEND_REQUEST_ACCEPT_SUCCESS_MESSAGE,
  FRIEND_REQUEST_REJECT_FAILURE_MESSAGE,
  FRIEND_REQUEST_REJECT_SUCCESS_MESSAGE,
  FRIEND_REQUEST_LIST_PAGE,
  FRIEND_REQUEST_LIST_SIZE,
} from "./constants";

export function useFriendListSection() {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(FRIEND_LIST_PAGE);
  const [fetchedFriends, setFetchedFriends] = useState<FriendListItemVM[]>([]);
  const [handledRequestIds, setHandledRequestIds] = useState<Set<number>>(new Set());
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const acceptFriendRequestMutation = useAcceptFriendRequestMutation();
  const deleteFriendMutation = useDeleteFriendMutation();
  const deleteFriendRequestMutation = useDeleteFriendRequestMutation();

  const friendsQuery = useFriendsQuery({
    page: currentPage,
    size: FRIEND_LIST_SIZE,
  });
  const friendRequestsQuery = useFriendRequestsQuery({
    page: FRIEND_REQUEST_LIST_PAGE,
    size: FRIEND_REQUEST_LIST_SIZE,
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
  const friendRequests = useMemo(
    () =>
      (friendRequestsQuery.data?.content ?? []).filter(
        (request) => !handledRequestIds.has(request.requestId),
      ),
    [friendRequestsQuery.data?.content, handledRequestIds],
  );

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

  const markHandledRequest = useCallback((requestId: number) => {
    setHandledRequestIds((prev) => {
      const next = new Set(prev);
      next.add(requestId);
      return next;
    });
  }, []);

  const addFriendFromRequest = useCallback((request: FriendRequestItemVM) => {
    setFetchedFriends((prev) => {
      if (prev.some((friend) => friend.id === request.id)) {
        return prev;
      }

      const acceptedFriend: FriendListItemVM = {
        id: request.id,
        nickname: request.nickname,
        email: request.email,
        profileImageUrl: request.profileImageUrl,
        isFriend: true,
      };

      return [acceptedFriend, ...prev];
    });
  }, []);

  const handleAcceptFriendRequest = useCallback(
    (requestId: number) => {
      if (acceptFriendRequestMutation.isPending) return;

      const targetRequest = friendRequests.find((request) => request.requestId === requestId);
      if (!targetRequest) return;

      acceptFriendRequestMutation.mutate(requestId, {
        onSuccess: () => {
          markHandledRequest(requestId);
          addFriendFromRequest(targetRequest);
          showToast(FRIEND_REQUEST_ACCEPT_SUCCESS_MESSAGE, "success");
        },
        onError: () => {
          showToast(FRIEND_REQUEST_ACCEPT_FAILURE_MESSAGE, "error");
        },
      });
    },
    [
      acceptFriendRequestMutation,
      addFriendFromRequest,
      friendRequests,
      markHandledRequest,
      showToast,
    ],
  );

  const handleRejectFriendRequest = useCallback(
    (requestId: number) => {
      if (deleteFriendRequestMutation.isPending) return;

      deleteFriendRequestMutation.mutate(requestId, {
        onSuccess: () => {
          markHandledRequest(requestId);
          showToast(FRIEND_REQUEST_REJECT_SUCCESS_MESSAGE, "success");
        },
        onError: () => {
          showToast(FRIEND_REQUEST_REJECT_FAILURE_MESSAGE, "error");
        },
      });
    },
    [deleteFriendRequestMutation, markHandledRequest, showToast],
  );

  return {
    friendRequests,
    acceptFriendRequest: handleAcceptFriendRequest,
    acceptingRequestId: acceptFriendRequestMutation.isPending
      ? acceptFriendRequestMutation.variables
      : null,
    rejectFriendRequest: handleRejectFriendRequest,
    rejectingRequestId: deleteFriendRequestMutation.isPending
      ? deleteFriendRequestMutation.variables
      : null,
    friends,
    deleteFriend: handleDeleteFriend,
    deletingFriendId: deleteFriendMutation.isPending ? deleteFriendMutation.variables : null,
    isLoading: friendsQuery.isLoading || friendRequestsQuery.isLoading,
    isError: friendsQuery.isError || friendRequestsQuery.isError,
    isFetching: friendsQuery.isFetching || friendRequestsQuery.isFetching,
    hasMore,
    loadMore,
  };
}
