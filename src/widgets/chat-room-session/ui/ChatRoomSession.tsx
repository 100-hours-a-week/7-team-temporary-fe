"use client";

import { useChatRoomSessionModel } from "@/features/chat-room-session";
import {
  CHAT_COMPOSER_MAX_LENGTH,
  ChatMessageComposer,
  ChatMessageFeed,
} from "@/widgets/chat-room-message-feed";

interface ChatRoomSessionProps {
  roomId: number;
  initialParticipantId?: number;
}

export function ChatRoomSession({ roomId, initialParticipantId }: ChatRoomSessionProps) {
  const {
    messages,
    myLastSeenMessageId,
    isLoading,
    isError,
    hasMore,
    isFetchingMore,
    loadMore,
    draftMessage,
    isExtraMenuOpen,
    isSendDisabled,
    handleDraftMessageChange,
    handleSendTextMessage,
    handleImageSelect,
    handleToggleExtraMenu,
  } = useChatRoomSessionModel({ roomId, initialParticipantId });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 px-6 pt-4">
        <ChatMessageFeed
          messages={messages}
          lastSeenMessageId={myLastSeenMessageId}
          isLoading={isLoading}
          isError={isError}
          hasMore={hasMore}
          isFetchingMore={isFetchingMore}
          onLoadMore={loadMore}
        />
      </div>

      <div className="shrink-0">
        <ChatMessageComposer
          value={draftMessage}
          maxLength={CHAT_COMPOSER_MAX_LENGTH}
          isExtraMenuOpen={isExtraMenuOpen}
          isSendDisabled={isSendDisabled}
          onChange={handleDraftMessageChange}
          onSend={handleSendTextMessage}
          onToggleExtraMenu={handleToggleExtraMenu}
          onImageSelect={handleImageSelect}
        />
      </div>
    </div>
  );
}
