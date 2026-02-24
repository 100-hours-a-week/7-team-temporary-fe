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

  return (
    <RoomFeed
      enabled={enabled}
      onChatSearchClick={handleOpenChatSearch}
    />
  );
}
