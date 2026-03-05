"use client";

import { useLayoutEffect } from "react";

import { useStackPage } from "@/widgets/stack";

import { ChatRoomHeaderActions } from "./ChatRoomHeaderActions";
import { EditGroupChatRoomStackPage } from "./EditGroupChatRoomStackPage";
import { GroupChatMembersStackPage } from "./GroupChatMembersStackPage";

interface UseChatRoomStackHeaderOptions {
  roomId: number;
}

export function useChatRoomStackHeader({ roomId }: UseChatRoomStackHeaderOptions) {
  const { push, setHeaderContent, setHeaderRightContent } = useStackPage();

  useLayoutEffect(() => {
    setHeaderContent(<span className="text-[18px] font-semibold text-black">채팅방</span>);
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
  }, [push, roomId, setHeaderContent, setHeaderRightContent]);
}
