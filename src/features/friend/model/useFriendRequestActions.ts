"use client";

import { useCallback, useMemo, useState } from "react";

import {
  type FriendListItemVM,
  type FriendRequestItemVM,
  useAcceptFriendRequestMutation,
  useDeleteFriendRequestMutation,
  useFriendRequestsQuery,
} from "@/entities/friend";
import { useToast } from "@/shared/ui/toast";

import {
  FRIEND_REQUEST_ACCEPT_FAILURE_MESSAGE,
  FRIEND_REQUEST_ACCEPT_SUCCESS_MESSAGE,
  FRIEND_REQUEST_LIST_PAGE,
  FRIEND_REQUEST_LIST_SIZE,
  FRIEND_REQUEST_REJECT_FAILURE_MESSAGE,
  FRIEND_REQUEST_REJECT_SUCCESS_MESSAGE,
} from "./constants";

interface UseFriendRequestActionsOptions {
  onAccepted: (friend: FriendListItemVM) => void;
}

function toFriendListItemFromRequest(request: FriendRequestItemVM): FriendListItemVM {
  return {
    id: request.id,
    nickname: request.nickname,
    email: request.email,
    profileImageUrl: request.profileImageUrl,
    relationStatus: "FRIEND",
  };
}

export function useFriendRequestActions({ onAccepted }: UseFriendRequestActionsOptions) {
  const { showToast } = useToast();
  const [handledRequestIds, setHandledRequestIds] = useState<Set<number>>(new Set());

  const friendRequestsQuery = useFriendRequestsQuery({
    page: FRIEND_REQUEST_LIST_PAGE,
    size: FRIEND_REQUEST_LIST_SIZE,
  });
  const acceptFriendRequestMutation = useAcceptFriendRequestMutation();
  const deleteFriendRequestMutation = useDeleteFriendRequestMutation();

  const markHandledRequest = useCallback((requestId: number) => {
    setHandledRequestIds((prev) => {
      const next = new Set(prev);
      next.add(requestId);
      return next;
    });
  }, []);

  const friendRequests = useMemo(
    () =>
      (friendRequestsQuery.data?.content ?? []).filter(
        (request) => !handledRequestIds.has(request.requestId),
      ),
    [friendRequestsQuery.data?.content, handledRequestIds],
  );

  const acceptFriendRequest = useCallback(
    (requestId: number) => {
      if (acceptFriendRequestMutation.isPending) return;

      const targetRequest = friendRequests.find((request) => request.requestId === requestId);
      if (!targetRequest) return;

      acceptFriendRequestMutation.mutate(requestId, {
        onSuccess: () => {
          markHandledRequest(requestId);
          onAccepted(toFriendListItemFromRequest(targetRequest));
          showToast(FRIEND_REQUEST_ACCEPT_SUCCESS_MESSAGE, "success");
        },
        onError: () => {
          showToast(FRIEND_REQUEST_ACCEPT_FAILURE_MESSAGE, "error");
        },
      });
    },
    [acceptFriendRequestMutation, friendRequests, markHandledRequest, onAccepted, showToast],
  );

  const rejectFriendRequest = useCallback(
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
    acceptFriendRequest,
    acceptingRequestId: acceptFriendRequestMutation.isPending
      ? acceptFriendRequestMutation.variables
      : null,
    rejectFriendRequest,
    rejectingRequestId: deleteFriendRequestMutation.isPending
      ? deleteFriendRequestMutation.variables
      : null,
    isInitialLoading: friendRequestsQuery.isLoading && !friendRequestsQuery.data,
    isError: friendRequestsQuery.isError,
    isFetching: friendRequestsQuery.isFetching,
  };
}
