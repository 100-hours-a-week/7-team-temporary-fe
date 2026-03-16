import type { ChatRoomListItemVM } from "@/entities/chat-room";
import { EmptyStateCard } from "@/shared/ui/empty";

import { ChatRoomListItem } from "./ChatRoomListItem";

interface ChatRoomListProps {
  items: ChatRoomListItemVM[];
  onChatRoomClick: (roomId: number) => void;
}

export function ChatRoomList({ items, onChatRoomClick }: ChatRoomListProps) {
  const emptyMessage = "아직 들어간 채팅방이 없어요\n새로운 채팅방을 만들어볼까요?";
  if (items.length === 0) {
    return (
      <EmptyStateCard
        message={emptyMessage}
        className="mt-4"
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.roomId}>
          <ChatRoomListItem
            item={item}
            onClick={onChatRoomClick}
          />
        </li>
      ))}
    </ul>
  );
}
