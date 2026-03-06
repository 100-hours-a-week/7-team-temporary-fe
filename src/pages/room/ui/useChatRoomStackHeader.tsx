"use client";

import { useMemo } from "react";
import { useLayoutEffect } from "react";

import { useChatRoomDetailQuery } from "@/entities/chat-room";
import { useStackPage } from "@/widgets/stack";

import { ChatRoomHeaderActions } from "./ChatRoomHeaderActions";
import { EditGroupChatRoomStackPage } from "./EditGroupChatRoomStackPage";
import { GroupChatMembersStackPage } from "./GroupChatMembersStackPage";

interface UseChatRoomStackHeaderOptions {
  roomId: number;
}

export function useChatRoomStackHeader({ roomId }: UseChatRoomStackHeaderOptions) {
  const { push, setHeaderContent, setHeaderRightContent } = useStackPage();
  const chatRoomDetailQuery = useChatRoomDetailQuery({ roomId });
  const headerTitle = useMemo(
    () => chatRoomDetailQuery.data?.title?.trim() || "채팅방",
    [chatRoomDetailQuery.data?.title],
  );

  useLayoutEffect(() => {
    setHeaderContent(<span className="text-[18px] font-semibold text-black">{headerTitle}</span>);
    setHeaderRightContent(
      <ChatRoomHeaderActions
        onMembersClick={() => push(<GroupChatMembersStackPage roomId={roomId} />)}
        onSettingsClick={() => push(<EditGroupChatRoomStackPage roomId={roomId} />)}
      />,
    );
    return () => {
      setHeaderContent(null);
      setHeaderRightContent(null);
    };
  }, [headerTitle, push, roomId, setHeaderContent, setHeaderRightContent]);
}
