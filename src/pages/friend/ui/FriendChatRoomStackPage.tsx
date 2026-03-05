"use client";

import { useLayoutEffect } from "react";

import { ChatRoomSession } from "@/widgets/chat-room-session";
import { useStackPage } from "@/widgets/stack";

interface FriendChatRoomStackPageProps {
  roomId: number;
}

export function FriendChatRoomStackPage({ roomId }: FriendChatRoomStackPageProps) {
  const { setHeaderContent, setHeaderRightContent } = useStackPage();

  useLayoutEffect(() => {
    setHeaderContent(<span className="text-[18px] font-semibold text-black">채팅</span>);
    setHeaderRightContent(null);
    return () => {
      setHeaderContent(null);
      setHeaderRightContent(null);
    };
  }, [setHeaderContent, setHeaderRightContent]);

  return <ChatRoomSession roomId={roomId} />;
}
