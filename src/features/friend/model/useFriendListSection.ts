"use client";

import { useCallback } from "react";

import { useDeleteFriendMutation } from "@/entities/friend";
import { useFriendChatEnterAction } from "./useFriendChatEnterAction";
import { useFriendListData } from "./useFriendListData";
import { useFriendRequestActions } from "./useFriendRequestActions";

interface UseFriendListSectionOptions {
  onFriendChatRoomEntered?: (roomId: number) => void;
}

export function useFriendListSection({
  onFriendChatRoomEntered,
}: UseFriendListSectionOptions = {}) {
  const friendListData = useFriendListData();
  const friendRequestActions = useFriendRequestActions({
    onAccepted: friendListData.prependFriend,
  });
  const friendChatEnterAction = useFriendChatEnterAction({
    onEntered: onFriendChatRoomEntered,
  });
  const deleteFriendMutation = useDeleteFriendMutation();

  const handleDeleteFriend = useCallback(
    (friendUserId: number) => {
      if (deleteFriendMutation.isPending) return;

      deleteFriendMutation.mutate(friendUserId, {
        onSuccess: () => {
          friendListData.removeFriend(friendUserId);
        },
      });
    },
    [deleteFriendMutation, friendListData],
  );

  return {
    friendRequests: friendRequestActions.friendRequests,
    acceptFriendRequest: friendRequestActions.acceptFriendRequest,
    acceptingRequestId: friendRequestActions.acceptingRequestId,
    rejectFriendRequest: friendRequestActions.rejectFriendRequest,
    rejectingRequestId: friendRequestActions.rejectingRequestId,
    friends: friendListData.friends,
    deleteFriend: handleDeleteFriend,
    deletingFriendId: deleteFriendMutation.isPending ? deleteFriendMutation.variables : null,
    enterFriendChatRoom: friendChatEnterAction.enterFriendChatRoom,
    enteringFriendId: friendChatEnterAction.enteringFriendId,
    isLoading: friendListData.isInitialLoading || friendRequestActions.isInitialLoading,
    isError: friendListData.isError || friendRequestActions.isError,
    isFetching: friendListData.isFetching || friendRequestActions.isFetching,
    hasMore: friendListData.hasMore,
    loadMore: friendListData.loadMore,
  };
}
