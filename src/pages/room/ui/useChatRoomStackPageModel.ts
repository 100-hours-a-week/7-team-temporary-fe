"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ChatMessageItemVM } from "@/entities/chat-room";
import {
  useChatRoomDetailQuery,
  useChatRoomMessagesInfiniteQuery,
  useChatRoomRealtime,
} from "@/entities/chat-room";
import { useAuthStore } from "@/entities/user";
import { requestPresignedUrl, uploadToPresignedUrl } from "@/shared/api";
import { chatStompSession } from "@/shared/socket";
import { useToast } from "@/shared/ui/toast";
import { CHAT_COMPOSER_MAX_LENGTH } from "@/widgets/chat-room-message-feed";

const CHAT_ROOM_MESSAGE_PAGE_SIZE = 50;
const INITIAL_PENDING_MESSAGE_ID = -1;
const CHAT_ROOM_STACK_INTERACTIVE_DELAY_MS = 220;

type PendingMessagePayload = Pick<ChatMessageItemVM, "messageType" | "content" | "imageUrls">;

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
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
  const nextPendingIdRef = useRef(INITIAL_PENDING_MESSAGE_ID);
  const { showToast } = useToast();

  const myUserId = useAuthStore((state) => state.userId ?? null);
  const isRoomEnabled = roomId > 0;
  const isChatRuntimeEnabled = isRoomEnabled && isInteractiveReady;
  const chatRoomDetailQuery = useChatRoomDetailQuery({
    roomId,
    enabled: isChatRuntimeEnabled && myUserId !== null,
  });

  const myParticipantId = useMemo(() => {
    if (myUserId === null) return undefined;
    const detail = chatRoomDetailQuery.data;
    if (!detail) return undefined;

    const participant = detail.participants.find((member) => member.userId === myUserId);
    if (participant?.participantId) return participant.participantId;

    // owner는 participants 목록에 없을 수 있어 userId fallback 유지
    if (detail.owner.userId === myUserId) return myUserId;
    return undefined;
  }, [chatRoomDetailQuery.data, myUserId]);

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
    participantId: myParticipantId,
    myUserId,
    enabled: isChatRuntimeEnabled && myParticipantId !== undefined,
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
    return chatStompSession.onMessageSendFailed(({ idempotencyKey, message }) => {
      setPendingMessages((prev) => {
        const next = new Map(prev);
        next.delete(idempotencyKey);
        return next;
      });
      showToast(message || "메시지 전송에 실패했습니다.", "error");
    });
  }, [showToast]);

  useEffect(() => {
    return chatStompSession.onMessageSendRejected(({ idempotencyKey, message }) => {
      setPendingMessages((prev) => {
        const next = new Map(prev);
        next.delete(idempotencyKey);
        return next;
      });
      showToast(message || "메시지 전송이 거절되었습니다.", "error");
    });
  }, [showToast]);

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
        senderId: myUserId,
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
    if (content.length > CHAT_COMPOSER_MAX_LENGTH) {
      showToast(`메시지는 최대 ${CHAT_COMPOSER_MAX_LENGTH}자까지 전송할 수 있습니다.`, "error");
      return;
    }

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
  }, [createPendingMessage, draftMessage, roomId, showToast]);

  const handleImageSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;

      const idempotencyKey = createIdempotencyKey();
      try {
        const { uploadUrl, imageKey } = await requestPresignedUrl("MESSAGES");
        await uploadToPresignedUrl(uploadUrl, file);

        chatStompSession.sendMessage({
          idempotencyKey,
          roomId,
          messageType: "IMAGE",
          content: file.name || "image",
          imageKeys: [imageKey],
        });
      } catch (error) {
        console.error("[chat-room] 이미지 메시지 전송 준비 실패", error);
        showToast("이미지 업로드에 실패했습니다.", "error");
      }
    },
    [roomId, showToast],
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
    isSendDisabled:
      draftMessage.trim().length === 0 || draftMessage.trim().length > CHAT_COMPOSER_MAX_LENGTH,
    handleDraftMessageChange,
    handleSendTextMessage,
    handleImageSelect,
    handleToggleExtraMenu,
  };
}
