import { useCallback } from "react";

import { ChatRoomStackPage } from "./ui/ChatRoomStackPage";
import { CamStudyRoomStackPage } from "./ui/CamStudyRoomStackPage";
import type { CamStudyRoomListItemVM } from "@/entities/cam-study-room";
import { ChatSearchStackPage } from "./ui/ChatSearchStackPage";
import { RoomFeed } from "@/widgets/room-feed";
import { useStackPage } from "@/widgets/stack";

interface RoomPageProps {
  enabled?: boolean;
}

export function RoomPage({ enabled = true }: RoomPageProps) {
  const { push } = useStackPage();

  const handleOpenChatSearch = useCallback(() => {
    push(<ChatSearchStackPage />);
  }, [push]);

  const handleOpenChatRoom = useCallback(
    (id: number) => {
      push(<ChatRoomStackPage roomId={id} />);
    },
    [push],
  );

  const handleOpenCamStudyRoom = useCallback(
    (room: CamStudyRoomListItemVM) => {
      push(
        <CamStudyRoomStackPage
          roomId={room.roomId}
          initialTitle={room.title}
          initialSummary={{
            activeCamParticipantsCount: room.participantsCount,
            participantsCount: room.participantsCount,
            maxParticipants: room.maxParticipants,
          }}
        />,
      );
    },
    [push],
  );

  return (
    <RoomFeed
      enabled={enabled}
      onChatRoomClick={handleOpenChatRoom}
      onCamStudyRoomClick={handleOpenCamStudyRoom}
      onChatSearchClick={handleOpenChatSearch}
    />
  );
}
