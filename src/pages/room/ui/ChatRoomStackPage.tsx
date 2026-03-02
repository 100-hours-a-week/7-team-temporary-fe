"use client";

import {
  CHAT_COMPOSER_MAX_LENGTH,
  ChatMessageComposer,
  ChatMessageFeed,
} from "@/widgets/chat-room-message-feed";
import { useChatRoomStackHeader } from "./useChatRoomStackHeader";
import { useChatRoomStackPageModel } from "./useChatRoomStackPageModel";

interface ChatRoomStackPageProps {
  roomId: number;
}

export function ChatRoomStackPage({ roomId }: ChatRoomStackPageProps) {
  useChatRoomStackHeader({ roomId });

  const {
    messages,
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
  } = useChatRoomStackPageModel({ roomId });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4">
        <ChatMessageFeed
          messages={messages}
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
