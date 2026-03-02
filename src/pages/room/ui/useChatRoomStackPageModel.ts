"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ChatMessageItemVM } from "@/entities/chat-room";
import { useChatRoomMessagesInfiniteQuery, useChatRoomRealtime } from "@/entities/chat-room";
import { chatStompSession } from "@/shared/socket";
import { CHAT_COMPOSER_MAX_LENGTH } from "@/widgets/chat-room-message-feed";

const CHAT_ROOM_MESSAGE_PAGE_SIZE = 50;
const INITIAL_PENDING_MESSAGE_ID = -1;
const CHAT_ROOM_STACK_INTERACTIVE_DELAY_MS = 220;

type PendingMessagePayload = Pick<ChatMessageItemVM, "messageType" | "content" | "imageUrls">;

function createIdempotencyKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface UseChatRoomStackPageModelOptions {
  roomId: number;
}

export function useChatRoomStackPageModel({ roomId }: UseChatRoomStackPageModelOptions) {
  const [draftMessage, setDraftMessage] = useState("");
  const [isExtraMenuOpen, setIsExtraMenuOpen] = useState(false);
  const [isInteractiveReady, setIsInteractiveReady] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<Map<string, ChatMessageItemVM>>(
    () => new Map(),
  );
  const objectUrlsRef = useRef<string[]>([]);
  const nextPendingIdRef = useRef(INITIAL_PENDING_MESSAGE_ID);

  const myUserId = chatStompSession.userId ?? 0;
  const isRoomEnabled = roomId > 0;
  const isChatRuntimeEnabled = isRoomEnabled && isInteractiveReady;

  useEffect(() => {
    setIsInteractiveReady(false);
    const timer = window.setTimeout(
      () => setIsInteractiveReady(true),
      CHAT_ROOM_STACK_INTERACTIVE_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [roomId]);

  const chatMessagesQuery = useChatRoomMessagesInfiniteQuery({
    roomId,
    size: CHAT_ROOM_MESSAGE_PAGE_SIZE,
    myUserId,
    enabled: isChatRuntimeEnabled,
  });

  const { realtimeMessages } = useChatRoomRealtime({
    roomId,
    myUserId,
    enabled: isChatRuntimeEnabled,
  });

  useEffect(() => {
    return chatStompSession.onMessageSendAccepted(({ idempotencyKey }) => {
      setPendingMessages((prev) => {
        const next = new Map(prev);
        next.delete(idempotencyKey);
        return next;
      });
    });
  }, []);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current = [];
    };
  }, []);

  const historicalMessageIds = useMemo(
    () => new Set(chatMessagesQuery.messages.map((message) => message.messageId)),
    [chatMessagesQuery.messages],
  );

  const newRealtimeMessages = useMemo(
    () => realtimeMessages.filter((message) => !historicalMessageIds.has(message.messageId)),
    [realtimeMessages, historicalMessageIds],
  );

  const messages = useMemo(
    () => [
      ...chatMessagesQuery.messages,
      ...newRealtimeMessages,
      ...Array.from(pendingMessages.values()),
    ],
    [chatMessagesQuery.messages, newRealtimeMessages, pendingMessages],
  );

  const createPendingMessage = useCallback(
    (payload: PendingMessagePayload): ChatMessageItemVM => {
      const messageId = nextPendingIdRef.current;
      nextPendingIdRef.current -= 1;

      return {
        messageId,
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
    },
    [myUserId],
  );

  const handleDraftMessageChange = useCallback((nextValue: string) => {
    setDraftMessage(nextValue.slice(0, CHAT_COMPOSER_MAX_LENGTH));
  }, []);

  const handleSendTextMessage = useCallback(() => {
    const content = draftMessage.trim();
    if (!content) return;

    const idempotencyKey = createIdempotencyKey();
    const pendingMessage = createPendingMessage({
      messageType: "TEXT",
      content,
      imageUrls: [],
    });

    setPendingMessages((prev) => new Map(prev).set(idempotencyKey, pendingMessage));
    setDraftMessage("");

    chatStompSession.sendMessage({
      idempotencyKey,
      roomId,
      messageType: "TEXT",
      content,
      imageKeys: [],
    });
  }, [createPendingMessage, draftMessage, roomId]);

  const handleImageSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;

      const imageUrl = URL.createObjectURL(file);
      objectUrlsRef.current.push(imageUrl);

      const idempotencyKey = createIdempotencyKey();
      const pendingMessage = createPendingMessage({
        messageType: "FILE",
        content: null,
        imageUrls: [imageUrl],
      });

      setPendingMessages((prev) => new Map(prev).set(idempotencyKey, pendingMessage));

      chatStompSession.sendMessage({
        idempotencyKey,
        roomId,
        messageType: "FILE",
        content: "",
        imageKeys: [],
      });
    },
    [createPendingMessage, roomId],
  );

  const handleToggleExtraMenu = useCallback(() => {
    setIsExtraMenuOpen((prev) => !prev);
  }, []);

  return {
    messages,
    isLoading: (!isInteractiveReady || chatMessagesQuery.isLoading) && messages.length === 0,
    isError: chatMessagesQuery.isError,
    hasMore: chatMessagesQuery.hasMore,
    isFetchingMore: chatMessagesQuery.isFetchingMore,
    loadMore: chatMessagesQuery.loadMore,
    draftMessage,
    isExtraMenuOpen,
    isSendDisabled: draftMessage.trim().length === 0,
    handleDraftMessageChange,
    handleSendTextMessage,
    handleImageSelect,
    handleToggleExtraMenu,
  };
}
