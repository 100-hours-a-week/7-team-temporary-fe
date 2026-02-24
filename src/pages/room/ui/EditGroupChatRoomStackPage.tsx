"use client";

import { useEffect } from "react";

import { useStackPage } from "@/widgets/stack";

interface EditGroupChatRoomStackPageProps {
  roomId: number;
}

export function EditGroupChatRoomStackPage({ roomId: _roomId }: EditGroupChatRoomStackPageProps) {
  const { setHeaderContent, setHeaderRightContent } = useStackPage();

  useEffect(() => {
    setHeaderContent(
      <span className="text-[18px] font-semibold text-black">그룹 채팅방 수정</span>,
    );
    setHeaderRightContent(null);
    return () => {
      setHeaderContent(null);
      setHeaderRightContent(null);
    };
  }, [setHeaderContent, setHeaderRightContent]);

  return <div className="px-6 pt-4" />;
}
