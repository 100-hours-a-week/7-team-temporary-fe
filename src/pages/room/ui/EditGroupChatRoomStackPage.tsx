"use client";

import { useCallback, useEffect } from "react";

import { EditChatRoomForm, PermissionInfoTooltip } from "@/features/chat-room-edit";
import { useStackPage } from "@/widgets/stack";

interface EditGroupChatRoomStackPageProps {
  roomId: number;
}

export function EditGroupChatRoomStackPage({ roomId }: EditGroupChatRoomStackPageProps) {
  const { pop, setHeaderContent, setHeaderRightContent } = useStackPage();
  const handleDeleted = useCallback(() => {
    pop();
    window.setTimeout(() => {
      pop();
    }, 360);
  }, [pop]);

  useEffect(() => {
    setHeaderContent(
      <span className="text-[18px] font-semibold text-black">그룹 채팅방 정보</span>,
    );
    setHeaderRightContent(
      <PermissionInfoTooltip
        message="방장이 아니면 채팅방 정보를 수정하거나 삭제할 수 없습니다."
        align="right"
      />,
    );
    return () => {
      setHeaderContent(null);
      setHeaderRightContent(null);
    };
  }, [setHeaderContent, setHeaderRightContent]);

  return (
    <EditChatRoomForm
      roomId={roomId}
      onDeleted={handleDeleted}
    />
  );
}
