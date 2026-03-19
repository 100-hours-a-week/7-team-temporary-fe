"use client";

import { useCallback, useEffect } from "react";

import { EditChatRoomForm, PermissionInfoTooltip } from "@/features/chat-room-edit";
import { useLeaveChatRoomMutation } from "@/features/chat-room-leave";
import { useToast } from "@/shared/ui/toast";
import { useStackPage } from "@/widgets/stack";

import { useGroupChatMembersStackPageModel } from "../model";

interface CamStudyRoomInfoStackPageProps {
  roomId: number;
}

export function CamStudyRoomInfoStackPage({ roomId }: CamStudyRoomInfoStackPageProps) {
  const { pop, setHeaderContent, setHeaderRightContent } = useStackPage();
  const { showToast } = useToast();
  const leaveChatRoomMutation = useLeaveChatRoomMutation();
  const { myParticipantId, isMyRoomOwner } = useGroupChatMembersStackPageModel({ roomId });

  useEffect(() => {
    setHeaderContent(
      <span className="text-[18px] font-semibold text-black">캠 스터디방 정보</span>,
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

  const handleDeleted = useCallback(() => {
    pop();
    window.setTimeout(() => {
      pop();
    }, 360);
  }, [pop]);

  const handleLeave = useCallback(async () => {
    if (typeof myParticipantId !== "number" || myParticipantId <= 0) {
      if (isMyRoomOwner) {
        showToast("방장은 채팅방을 나갈 수 없습니다.", "error");
        return;
      }
      showToast("참여자 정보를 확인하지 못했습니다.", "error");
      return;
    }

    try {
      await leaveChatRoomMutation.mutateAsync({ roomId, participantId: myParticipantId });
      showToast("채팅방에서 나갔습니다.", "success");
      pop();
      window.setTimeout(() => {
        pop();
      }, 360);
    } catch {
      showToast("채팅방 나가기에 실패했습니다.", "error");
    }
  }, [isMyRoomOwner, leaveChatRoomMutation, myParticipantId, pop, roomId, showToast]);

  return (
    <EditChatRoomForm
      roomId={roomId}
      onDeleted={handleDeleted}
      onLeave={() => void handleLeave()}
    />
  );
}
