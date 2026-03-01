"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { ChatMessageItemVM } from "@/entities/chat-room";
import {
  useChatRoomMessagesInfiniteQuery,
  useChatRoomOwnerStatusQuery,
} from "@/entities/chat-room";
import {
  CHAT_COMPOSER_MAX_LENGTH,
  ChatMessageComposer,
  ChatMessageFeed,
} from "@/widgets/chat-room-message-feed";
import { useChatRoomStackHeader } from "./useChatRoomStackHeader";

interface ChatRoomStackPageProps {
  roomId: number;
}

export function ChatRoomStackPage({ roomId }: ChatRoomStackPageProps) {
  const [draftMessage, setDraftMessage] = useState("");
  const [isExtraMenuOpen, setIsExtraMenuOpen] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessageItemVM[]>([]);
  const nextLocalMessageIdRef = useRef(-1);
  const objectUrlsRef = useRef<string[]>([]);

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

  const messages = useMemo(
    () => [...chatMessagesQuery.messages, ...localMessages],
    [chatMessagesQuery.messages, localMessages],
  );
  const isSendDisabled = draftMessage.trim().length === 0;

  const createLocalMessage = (
    payload: Pick<ChatMessageItemVM, "messageType" | "content" | "imageUrls">,
  ): ChatMessageItemVM => {
    const localMessageId = nextLocalMessageIdRef.current;
    nextLocalMessageIdRef.current -= 1;
    return {
      messageId: localMessageId,
      messageType: payload.messageType,
      senderType: "USER",
      senderId: null,
      senderName: "나",
      senderProfileImageUrl: null,
      isMine: true,
      content: payload.content,
      imageUrls: payload.imageUrls,
      sentAt: new Date().toISOString(),
    };
  };

  const handleDraftMessageChange = (nextValue: string) => {
    setDraftMessage(nextValue.slice(0, CHAT_COMPOSER_MAX_LENGTH));
  };

  const handleSendTextMessage = () => {
    const content = draftMessage.trim();
    if (!content) return;

    const nextMessage = createLocalMessage({
      messageType: "TEXT",
      content,
      imageUrls: [],
    });

    setLocalMessages((prev) => [...prev, nextMessage]);
    setDraftMessage("");
  };

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const imageUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(imageUrl);

    const nextMessage = createLocalMessage({
      messageType: "FILE",
      content: null,
      imageUrls: [imageUrl],
    });

    setLocalMessages((prev) => [...prev, nextMessage]);
  };

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current = [];
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4">
        <ChatMessageFeed
          messages={messages}
          isLoading={chatMessagesQuery.isLoading && messages.length === 0}
          isError={chatMessagesQuery.isError}
          hasMore={chatMessagesQuery.hasMore}
          isFetchingMore={chatMessagesQuery.isFetchingMore}
          onLoadMore={chatMessagesQuery.loadMore}
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
          onToggleExtraMenu={() => setIsExtraMenuOpen((prev) => !prev)}
          onImageSelect={handleImageSelect}
        />
      </div>
    </div>
  );
}
