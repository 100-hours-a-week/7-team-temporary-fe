"use client";

import { useEffect } from "react";

import { EditChatRoomForm } from "@/features/chat-room-edit";
import { useStackPage } from "@/widgets/stack";

interface EditGroupChatRoomStackPageProps {
  roomId: number;
}

export function EditGroupChatRoomStackPage({ roomId }: EditGroupChatRoomStackPageProps) {
  const { pop, setHeaderContent, setHeaderRightContent } = useStackPage();

  useEffect(() => {
    setHeaderContent(
      <span className="text-[18px] font-semibold text-black">그룹 채팅방 정보</span>,
    );
    setHeaderRightContent(null);
    return () => {
      setHeaderContent(null);
      setHeaderRightContent(null);
    };
  }, [setHeaderContent, setHeaderRightContent]);

  return (
    <EditChatRoomForm
      roomId={roomId}
      onDeleted={pop}
    />
  );
}
