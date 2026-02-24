"use client";

import { useChatRoomMessagesInfiniteQuery, useChatRoomOwnerStatusQuery } from "@/entities/chat-room";
import { ChatMessageFeed } from "@/widgets/chat-room-message-feed";
import { useChatRoomStackHeader } from "./useChatRoomStackHeader";

interface ChatRoomStackPageProps {
  roomId: number;
}

export function ChatRoomStackPage({ roomId }: ChatRoomStackPageProps) {
  const chatMessagesQuery = useChatRoomMessagesInfiniteQuery({
    roomId,
    size: 50,
    enabled: roomId > 0,
  });
  const { data: ownerStatus } = useChatRoomOwnerStatusQuery({
    ownerId: roomId,
    enabled: roomId > 0,
  });
  const isOwner = ownerStatus?.isOwner ?? false;

  useChatRoomStackHeader({ roomId, isOwner });

  return (
    <div className="px-6 pt-4">
      <ChatMessageFeed
        messages={chatMessagesQuery.messages}
        isLoading={chatMessagesQuery.isLoading}
        isError={chatMessagesQuery.isError}
        hasMore={chatMessagesQuery.hasMore}
        isFetchingMore={chatMessagesQuery.isFetchingMore}
        onLoadMore={chatMessagesQuery.loadMore}
      />
    </div>
  );
}
