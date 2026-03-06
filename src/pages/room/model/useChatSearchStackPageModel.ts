"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import {
  chatRoomQueryKeys,
  fetchChatRoomSearchList,
  type ChatRoomSummaryDto,
} from "@/entities/chat-room";
import { useAuthStore } from "@/entities/user";
import { useJoinChatRoomMutation } from "@/features/chat-room-join";
import { useToast } from "@/shared/ui/toast";
import {
  CHAT_SEARCH_PAGE,
  CHAT_SEARCH_SIZE,
  JOIN_CHAT_ROOM_USER_ID_REQUIRED_MESSAGE,
} from "./chatSearch.constants";
import {
  getJoinChatRoomErrorMessage,
  resolveParticipantIdFromAccessToken,
} from "./chatSearch.utils";

interface UseChatSearchStackPageModelOptions {
  onJoinSuccess: (roomId: number) => void;
}

export function useChatSearchStackPageModel({ onJoinSuccess }: UseChatSearchStackPageModelOptions) {
  const [keyword, setKeyword] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomSummaryDto | null>(null);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const participantId = useMemo(
    () => resolveParticipantIdFromAccessToken(accessToken),
    [accessToken],
  );
  const joinChatRoomMutation = useJoinChatRoomMutation();
  const { showToast } = useToast();

  const normalizedKeyword = keyword.trim();
  const searchListQuery = useQuery({
    queryKey: chatRoomQueryKeys.search(normalizedKeyword, CHAT_SEARCH_PAGE, CHAT_SEARCH_SIZE),
    queryFn: ({ signal }) =>
      fetchChatRoomSearchList({
        title: normalizedKeyword,
        page: CHAT_SEARCH_PAGE,
        size: CHAT_SEARCH_SIZE,
        signal,
      }),
    refetchOnMount: "always",
  });
  const filteredRooms = searchListQuery.data?.content ?? [];

  const handleOpenRoomDialog = useCallback((room: ChatRoomSummaryDto) => {
    setSelectedRoom(room);
    setIsJoinDialogOpen(true);
  }, []);

  const handleJoinDialogOpenChange = useCallback((open: boolean) => {
    setIsJoinDialogOpen(open);
    if (!open) {
      setSelectedRoom(null);
    }
  }, []);

  const handleSearchAction = useCallback(() => {
    setKeyword((prev) => prev.trim());
  }, []);

  const handleJoinRoom = useCallback(async () => {
    if (!selectedRoom) return;
    if (!participantId) {
      showToast(JOIN_CHAT_ROOM_USER_ID_REQUIRED_MESSAGE, "error");
      return;
    }

    try {
      await joinChatRoomMutation.mutateAsync({
        roomId: selectedRoom.roomId,
        participantId,
      });
      onJoinSuccess(selectedRoom.roomId);
      setIsJoinDialogOpen(false);
      setSelectedRoom(null);
    } catch (error) {
      showToast(getJoinChatRoomErrorMessage(error), "error");
    }
  }, [joinChatRoomMutation, onJoinSuccess, participantId, selectedRoom, showToast]);

  return {
    keyword,
    setKeyword,
    handleSearchAction,
    searchListQuery,
    filteredRooms,
    selectedRoom,
    isJoinDialogOpen,
    handleOpenRoomDialog,
    handleJoinDialogOpenChange,
    handleJoinRoom,
    isJoinPending: joinChatRoomMutation.isPending,
  };
}
