"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { ChatMessageItemVM } from "@/entities/chat-room";
import {
  useChatRoomMessagesInfiniteQuery,
  useChatRoomOwnerStatusQuery,
  useChatRoomRealtime,
} from "@/entities/chat-room";
import { chatStompSession } from "@/shared/socket";
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
  // pendingMessages: optimistic local messages keyed by idempotencyKey
  const [pendingMessages, setPendingMessages] = useState<Map<string, ChatMessageItemVM>>(new Map());
  const objectUrlsRef = useRef<string[]>([]);
  const nextPendingIdRef = useRef(-1);

  const myUserId = chatStompSession.userId ?? 0;

  const chatMessagesQuery = useChatRoomMessagesInfiniteQuery({
    roomId,
    size: 50,
    myUserId,
    enabled: roomId > 0,
  });
  const { data: ownerStatus } = useChatRoomOwnerStatusQuery({
    ownerId: roomId,
    enabled: roomId > 0,
  });
  const isOwner = ownerStatus?.isOwner ?? false;

  useChatRoomStackHeader({ roomId, isOwner });

  const { realtimeMessages } = useChatRoomRealtime({
    roomId,
    myUserId,
    enabled: roomId > 0,
  });

  // Remove pending message when server confirms it via sendAccepted
  useEffect(() => {
    return chatStompSession.onMessageSendAccepted(({ idempotencyKey }) => {
      setPendingMessages((prev) => {
        const next = new Map(prev);
        next.delete(idempotencyKey);
        return next;
      });
    });
  }, []);

  // Filter realtime messages that overlap with already-loaded historical messages
  const historicalIds = useMemo(
    () => new Set(chatMessagesQuery.messages.map((m) => m.messageId)),
    [chatMessagesQuery.messages],
  );

  const newRealtimeMessages = useMemo(
    () => realtimeMessages.filter((m) => !historicalIds.has(m.messageId)),
    [realtimeMessages, historicalIds],
  );

  const messages = useMemo(
    () => [
      ...chatMessagesQuery.messages,
      ...newRealtimeMessages,
      ...Array.from(pendingMessages.values()),
    ],
    [chatMessagesQuery.messages, newRealtimeMessages, pendingMessages],
  );

  const isSendDisabled = draftMessage.trim().length === 0;

  const createPendingMessage = (
    payload: Pick<ChatMessageItemVM, "messageType" | "content" | "imageUrls">,
  ): ChatMessageItemVM => {
    const id = nextPendingIdRef.current;
    nextPendingIdRef.current -= 1;
    return {
      messageId: id,
      messageType: payload.messageType,
      senderType: "USER",
      senderId: myUserId || null,
      senderName: null,
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

    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const pendingVm = createPendingMessage({ messageType: "TEXT", content, imageUrls: [] });

    setPendingMessages((prev) => new Map(prev).set(idempotencyKey, pendingVm));
    setDraftMessage("");

    chatStompSession.sendMessage({
      idempotencyKey,
      roomId,
      messageType: "TEXT",
      content,
      imageKeys: [],
    });
  };

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const imageUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(imageUrl);

    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const pendingVm = createPendingMessage({
      messageType: "FILE",
      content: null,
      imageUrls: [imageUrl],
    });

    setPendingMessages((prev) => new Map(prev).set(idempotencyKey, pendingVm));

    // Image upload flow: upload to S3 first, then send with imageKeys
    // For now we send the message after getting the object URL (placeholder)
    chatStompSession.sendMessage({
      idempotencyKey,
      roomId,
      messageType: "FILE",
      content: "",
      imageKeys: [],
    });
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
