"use client";

import { useEffect, useMemo } from "react";

import { useChatRoomDetailQuery } from "@/entities/chat-room";
import { useStackPage } from "@/widgets/stack";

interface UseGroupChatMembersStackPageModelOptions {
  roomId: number;
}

export function useGroupChatMembersStackPageModel({
  roomId,
}: UseGroupChatMembersStackPageModelOptions) {
  const { setHeaderContent, setHeaderRightContent } = useStackPage();
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

  return {
    isLoading: chatRoomDetailQuery.isLoading,
    isError: chatRoomDetailQuery.isError,
    items,
  };
}
