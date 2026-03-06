"use client";

import { useCallback } from "react";

import { useToast } from "@/shared/ui/toast";

import { FRIEND_CHAT_ENTER_FAILURE_MESSAGE } from "./constants";
import { useEnterFriendChatRoomMutation } from "./useEnterFriendChatRoomMutation";

interface UseFriendChatEnterActionOptions {
  onEntered?: (roomId: number) => void;
}

export function useFriendChatEnterAction({ onEntered }: UseFriendChatEnterActionOptions = {}) {
  const { showToast } = useToast();
  const enterFriendChatRoomMutation = useEnterFriendChatRoomMutation();

  const enterFriendChatRoom = useCallback(
    (friendUserId: number) => {
      if (enterFriendChatRoomMutation.isPending) return;

      enterFriendChatRoomMutation.mutate(
        { friendId: friendUserId },
        {
          onSuccess: (data) => {
            if (!data?.roomId) {
              showToast(FRIEND_CHAT_ENTER_FAILURE_MESSAGE, "error");
              return;
            }
            onEntered?.(data.roomId);
          },
          onError: () => {
            showToast(FRIEND_CHAT_ENTER_FAILURE_MESSAGE, "error");
          },
        },
      );
    },
    [enterFriendChatRoomMutation, onEntered, showToast],
  );

  return {
    enterFriendChatRoom,
    enteringFriendId: enterFriendChatRoomMutation.isPending
      ? (enterFriendChatRoomMutation.variables?.friendId ?? null)
      : null,
  };
}
