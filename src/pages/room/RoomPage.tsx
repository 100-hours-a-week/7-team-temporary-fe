import { useCallback } from "react";

import type { CamStudyRoomListItemVM } from "@/entities/cam-study-room-list";
import { RoomFeed } from "@/widgets/room-feed";
import { useStackPage } from "@/widgets/stack";

interface RoomPageProps {
  enabled?: boolean;
}

export function RoomPage({ enabled = true }: RoomPageProps) {
  const { push } = useStackPage();

  const handleOpenChatSearch = useCallback(() => {
    void import("./ui/ChatSearchStackPage").then(({ ChatSearchStackPage }) => {
      push(<ChatSearchStackPage />);
    });
  }, [push]);

  const handleOpenChatRoom = useCallback(
    (id: number) => {
      void import("./ui/ChatRoomStackPage").then(({ ChatRoomStackPage }) => {
        push(<ChatRoomStackPage roomId={id} />);
      });
    },
    [push],
  );

  const handleOpenCamStudyRoom = useCallback(
    (room: CamStudyRoomListItemVM) => {
      void import("./ui/CamStudyRoomStackPage").then(({ CamStudyRoomStackPage }) => {
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
      });
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
