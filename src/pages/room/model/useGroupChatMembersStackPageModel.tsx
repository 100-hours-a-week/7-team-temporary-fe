"use client";

import { useEffect, useMemo } from "react";

import { useChatRoomDetailQuery } from "@/entities/chat-room";
import { useAuthStore } from "@/entities/user";
import { useStackPage } from "@/widgets/stack";

interface UseGroupChatMembersStackPageModelOptions {
  roomId: number;
}

export function useGroupChatMembersStackPageModel({
  roomId,
}: UseGroupChatMembersStackPageModelOptions) {
  const { setHeaderContent, setHeaderRightContent } = useStackPage();
  const myUserId = useAuthStore((state) => state.userId ?? null);
  const chatRoomDetailQuery = useChatRoomDetailQuery({ roomId });

  useEffect(() => {
    setHeaderContent(<span className="text-[18px] font-semibold text-black">그룹원 목록</span>);
    setHeaderRightContent(null);
    return () => {
      setHeaderContent(null);
      setHeaderRightContent(null);
    };
  }, [setHeaderContent, setHeaderRightContent]);

  const items = useMemo(() => {
    const detail = chatRoomDetailQuery.data;
    if (!detail) return [];

    return [detail.owner, ...detail.participants];
  }, [chatRoomDetailQuery.data]);

  const myParticipantId = useMemo(() => {
    if (myUserId === null) return null;
    const detail = chatRoomDetailQuery.data;
    if (!detail) return null;

    const participant = detail.participants.find((member) => member.userId === myUserId);
    return participant?.participantId ?? null;
  }, [chatRoomDetailQuery.data, myUserId]);

  const isMyRoomOwner = useMemo(() => {
    if (myUserId === null) return false;
    return chatRoomDetailQuery.data?.owner.userId === myUserId;
  }, [chatRoomDetailQuery.data, myUserId]);

  return {
    isLoading: chatRoomDetailQuery.isLoading,
    isError: chatRoomDetailQuery.isError,
    items,
    myParticipantId,
    isMyRoomOwner,
  };
}
