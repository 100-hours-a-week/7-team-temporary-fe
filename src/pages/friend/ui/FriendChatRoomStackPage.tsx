"use client";

import { useMemo } from "react";
import { useLayoutEffect } from "react";

import { useChatRoomDetailQuery } from "@/entities/chat-room";
import { useAuthStore } from "@/entities/user";
import { ChatRoomSession } from "@/widgets/chat-room-session";
import { useStackPage } from "@/widgets/stack";

interface FriendChatRoomStackPageProps {
  roomId: number;
}

export function FriendChatRoomStackPage({ roomId }: FriendChatRoomStackPageProps) {
  const { setHeaderContent, setHeaderRightContent } = useStackPage();
  const myUserId = useAuthStore((state) => state.userId ?? null);
  const chatRoomDetailQuery = useChatRoomDetailQuery({
    roomId,
    enabled: myUserId !== null,
  });

  const friendName = useMemo(() => {
    const detail = chatRoomDetailQuery.data;
    if (!detail || myUserId === null) return null;

    const peerFromParticipants = detail.participants.find((member) => member.userId !== myUserId);
    if (peerFromParticipants?.nickname) return peerFromParticipants.nickname;

    if (detail.owner.userId !== myUserId) return detail.owner.nickname;
    return null;
  }, [chatRoomDetailQuery.data, myUserId]);

  useLayoutEffect(() => {
    setHeaderContent(
      <span className="text-[18px] font-semibold text-black">{friendName || "채팅"}</span>,
    );
    setHeaderRightContent(null);
    return () => {
      setHeaderContent(null);
      setHeaderRightContent(null);
    };
  }, [friendName, setHeaderContent, setHeaderRightContent]);

  return <ChatRoomSession roomId={roomId} />;
}
