"use client";

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
  const headerTitle = chatRoomDetailQuery.data?.title?.trim() || "채팅방";

  useLayoutEffect(() => {
    setHeaderContent(<span className="text-[18px] font-semibold text-black">{headerTitle}</span>);
    return () => {
      setHeaderContent(null);
      setHeaderRightContent(null);
    };
  }, [headerTitle, setHeaderContent, setHeaderRightContent]);

  useLayoutEffect(() => {
    setHeaderRightContent(
      <ChatRoomHeaderActions
        onMembersClick={() => push(<GroupChatMembersStackPage roomId={roomId} />)}
        onSettingsClick={() => push(<EditGroupChatRoomStackPage roomId={roomId} />)}
      />,
    );
  }, [push, roomId, setHeaderRightContent]);
}
