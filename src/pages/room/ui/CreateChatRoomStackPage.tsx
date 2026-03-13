"use client";

import { useEffect } from "react";
import { CreateChatRoomForm } from "@/features/chat-room-create";
import { useStackPage } from "@/widgets/stack";
import { CamStudyRoomStackPage } from "./CamStudyRoomStackPage";
import { ChatRoomStackPage } from "./ChatRoomStackPage";

export function CreateChatRoomStackPage() {
  const { replace, setHeaderContent, setHeaderRightContent } = useStackPage();

  useEffect(() => {
    setHeaderContent(<span className="text-[18px] font-semibold text-black">방 생성</span>);
    setHeaderRightContent(null);
    return () => {
      setHeaderContent(null);
      setHeaderRightContent(null);
    };
  }, [setHeaderContent, setHeaderRightContent]);

  return (
    <CreateChatRoomForm
      onCreated={({ roomId, participantId }, type) => {
        if (type === "CAM_STUDY") {
          replace(<CamStudyRoomStackPage roomId={roomId} />);
          return;
        }

        replace(
          <ChatRoomStackPage
            roomId={roomId}
            initialParticipantId={participantId}
          />,
        );
      }}
    />
  );
}
