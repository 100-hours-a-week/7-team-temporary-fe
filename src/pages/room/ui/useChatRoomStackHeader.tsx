"use client";

import { useEffect } from "react";

import { useStackPage } from "@/widgets/stack";

import { ChatRoomHeaderActions } from "./ChatRoomHeaderActions";
import { EditGroupChatRoomStackPage } from "./EditGroupChatRoomStackPage";
import { GroupChatMembersStackPage } from "./GroupChatMembersStackPage";

interface UseChatRoomStackHeaderOptions {
  roomId: number;
  isOwner: boolean;
}

export function useChatRoomStackHeader({ roomId, isOwner }: UseChatRoomStackHeaderOptions) {
  const { push, setHeaderContent, setHeaderRightContent } = useStackPage();

  useEffect(() => {
    setHeaderContent(<span className="text-[18px] font-semibold text-black">채팅방</span>);
    return () => {
      setHeaderContent(null);
      setHeaderRightContent(null);
    };
  }, [setHeaderContent, setHeaderRightContent]);

  useEffect(() => {
    setHeaderRightContent(
      <ChatRoomHeaderActions
        isOwner={isOwner}
        onMembersClick={() => push(<GroupChatMembersStackPage roomId={roomId} />)}
        onSettingsClick={() => push(<EditGroupChatRoomStackPage roomId={roomId} />)}
      />,
    );
  }, [isOwner, push, roomId, setHeaderRightContent]);
}
