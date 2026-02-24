import { ChatRoomStackPage } from "./ui/ChatRoomStackPage";
import { ChatSearchStackPage } from "./ui/ChatSearchStackPage";
import { RoomFeed } from "@/widgets/room-feed";
import { useStackPage } from "@/widgets/stack";

interface RoomPageProps {
  enabled?: boolean;
}

export function RoomPage({ enabled = true }: RoomPageProps) {
  const { push } = useStackPage();

  const handleOpenChatSearch = () => {
    push(<ChatSearchStackPage />);
  };

  const handleOpenChatRoom = (id: number) => {
    push(<ChatRoomStackPage roomId={id} />);
  };

  return (
    <RoomFeed
      enabled={enabled}
      onChatRoomClick={handleOpenChatRoom}
      onChatSearchClick={handleOpenChatSearch}
    />
  );
}
