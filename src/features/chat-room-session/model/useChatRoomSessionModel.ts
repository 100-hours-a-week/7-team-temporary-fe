"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import type { ChatMessageItemVM } from "@/entities/chat-room";
import {
  chatRoomQueryKeys,
  useChatRoomDetailQuery,
  useChatRoomMessagesInfiniteQuery,
  useChatRoomRealtime,
} from "@/entities/chat-room";
import type { ChatRoomListModel } from "@/entities/chat-room";
import { useAuthStore } from "@/entities/user";
import { requestPresignedUrl, uploadToPresignedUrl } from "@/shared/api";
import { chatStompSession } from "@/shared/socket";
import { useToast } from "@/shared/ui/toast";

const CHAT_ROOM_MESSAGE_PAGE_SIZE = 50;
const CHAT_ROOM_MESSAGE_MAX_LENGTH = 3000;
const INITIAL_PENDING_MESSAGE_ID = -1;
const CHAT_ROOM_STACK_INTERACTIVE_DELAY_MS = 220;

type PendingMessagePayload = Pick<ChatMessageItemVM, "messageType" | "content" | "imageUrls">;

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toRoomFeedPreviewFromPendingMessage(message: ChatMessageItemVM): string {
  const content = message.content?.trim();
  if (message.messageType === "IMAGE") {
    return content && content.length > 0 ? content : "이미지";
  }
  return content && content.length > 0 ? content : "메시지";
}

function toRoomFeedPreviewFromMessage(message: ChatMessageItemVM): string {
  const content = message.content?.trim();
  if (message.messageType === "IMAGE") {
    return content && content.length > 0 ? content : "이미지";
  }
  return content && content.length > 0 ? content : "메시지";
}

interface UseChatRoomSessionModelOptions {
  roomId: number;
}

export function useChatRoomSessionModel({ roomId }: UseChatRoomSessionModelOptions) {
  const queryClient = useQueryClient();
  const [draftMessage, setDraftMessage] = useState("");
  const [isExtraMenuOpen, setIsExtraMenuOpen] = useState(false);
  const [isInteractiveReady, setIsInteractiveReady] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<Map<string, ChatMessageItemVM>>(
    () => new Map(),
  );
  const lastSeenUpdatedMessageIdRef = useRef(0);
  const lastRoomFeedPatchedMessageIdRef = useRef(0);
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
    return undefined;
  }, [chatRoomDetailQuery.data, myUserId]);

  const myLastSeenMessageId = useMemo(() => {
    if (myUserId === null) return null;
    const detail = chatRoomDetailQuery.data;
    if (!detail) return null;

    const participant = detail.participants.find((member) => member.userId === myUserId);
    if (!participant) return null;

    return typeof participant.lastSeenMessageId === "number" ? participant.lastSeenMessageId : null;
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
    lastRoomFeedPatchedMessageIdRef.current = 0;
  }, [roomId]);

  const patchRoomFeedLatestMessage = useCallback(
    (payload: { lastMessage: string; lastMessageAt: string }) => {
      queryClient.setQueriesData<ChatRoomListModel>(
        { queryKey: chatRoomQueryKeys.listAll() },
        (current) => {
          if (!current) return current;

          let isPatched = false;
          const content = current.content.map((room) => {
            if (room.roomId !== roomId) return room;
            isPatched = true;
            return {
              ...room,
              lastMessage: payload.lastMessage,
              lastMessageAt: payload.lastMessageAt,
              unreadCount: 0,
            };
          });

          if (!isPatched) return current;
          return { ...current, content };
        },
      );
    },
    [queryClient, roomId],
  );

  const patchRoomFeedUnreadCount = useCallback(
    (unreadCount: number) => {
      queryClient.setQueriesData<ChatRoomListModel>(
        { queryKey: chatRoomQueryKeys.listAll() },
        (current) => {
          if (!current) return current;

          let isPatched = false;
          const content = current.content.map((room) => {
            if (room.roomId !== roomId) return room;
            isPatched = true;
            return {
              ...room,
              unreadCount,
            };
          });

          if (!isPatched) return current;
          return { ...current, content };
        },
      );
    },
    [queryClient, roomId],
  );

  useEffect(() => {
    return chatStompSession.onMessageSendAccepted(({ idempotencyKey }) => {
      setPendingMessages((prev) => {
        if (!prev.has(idempotencyKey)) return prev;
        const next = new Map(prev);
        next.delete(idempotencyKey);
        return next;
      });
    });
  }, []);

  useEffect(() => {
    if (myUserId === null) return;
    if (realtimeMessages.length === 0) return;

    const latestMine = [...realtimeMessages]
      .reverse()
      .find((message) => message.senderType === "USER" && message.senderId === myUserId);
    if (!latestMine) return;
    if (latestMine.messageId <= lastRoomFeedPatchedMessageIdRef.current) return;

    lastRoomFeedPatchedMessageIdRef.current = latestMine.messageId;
    patchRoomFeedLatestMessage({
      lastMessage: toRoomFeedPreviewFromMessage(latestMine),
      lastMessageAt: latestMine.sentAt,
    });
  }, [myUserId, patchRoomFeedLatestMessage, realtimeMessages]);

  useEffect(() => {
    return chatStompSession.onMessageSendFailed(({ idempotencyKey, message }) => {
      setPendingMessages((prev) => {
        const next = new Map(prev);
        next.delete(idempotencyKey);
        return next;
      });
      void queryClient.invalidateQueries({ queryKey: chatRoomQueryKeys.listAll() });
      showToast(message || "메시지 전송에 실패했습니다.", "error");
    });
  }, [queryClient, showToast]);

  useEffect(() => {
    return chatStompSession.onMessageSendRejected(({ idempotencyKey, message }) => {
      setPendingMessages((prev) => {
        const next = new Map(prev);
        next.delete(idempotencyKey);
        return next;
      });
      void queryClient.invalidateQueries({ queryKey: chatRoomQueryKeys.listAll() });
      showToast(message || "메시지 전송이 거절되었습니다.", "error");
    });
  }, [queryClient, showToast]);

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

  const latestConfirmedMessageId = useMemo(
    () =>
      messages.reduce((latestId, message) => {
        if (message.messageId <= 0) return latestId;
        return Math.max(latestId, message.messageId);
      }, 0),
    [messages],
  );

  useEffect(() => {
    lastSeenUpdatedMessageIdRef.current = 0;
  }, [roomId]);

  useEffect(() => {
    if (!isChatRuntimeEnabled) return;
    if (typeof myParticipantId !== "number" || myParticipantId <= 0) return;
    if (latestConfirmedMessageId <= 0) return;
    if (latestConfirmedMessageId <= lastSeenUpdatedMessageIdRef.current) return;

    lastSeenUpdatedMessageIdRef.current = latestConfirmedMessageId;
    // 읽음 전송 시 목록 unread를 먼저 낙관적으로 0으로 반영한다.
    patchRoomFeedUnreadCount(0);
    void queryClient.invalidateQueries({
      queryKey: chatRoomQueryKeys.listAll(),
      refetchType: "none",
    });
    chatStompSession.sendLastSeenUpdate({
      participantId: myParticipantId,
      lastSeenMessageId: latestConfirmedMessageId,
    });
  }, [
    isChatRuntimeEnabled,
    latestConfirmedMessageId,
    myParticipantId,
    patchRoomFeedUnreadCount,
    queryClient,
  ]);

  const createPendingMessage = useCallback(
    (payload: PendingMessagePayload): ChatMessageItemVM => {
      const messageId = nextPendingIdRef.current;
      nextPendingIdRef.current -= 1;

      return {
        messageId,
        messageType: payload.messageType,
        senderType: "USER",
        senderId: myUserId,
        senderNickname: null,
        senderProfile: null,
        isMine: true,
        content: payload.content,
        imageUrls: payload.imageUrls,
        sentAt: new Date().toISOString(),
      };
    },
    [myUserId],
  );

  const handleDraftMessageChange = useCallback((nextValue: string) => {
    setDraftMessage(nextValue.slice(0, CHAT_ROOM_MESSAGE_MAX_LENGTH));
  }, []);

  const handleSendTextMessage = useCallback(() => {
    const content = draftMessage.trim();
    if (!content) return;
    if (content.length > CHAT_ROOM_MESSAGE_MAX_LENGTH) {
      showToast(`메시지는 최대 ${CHAT_ROOM_MESSAGE_MAX_LENGTH}자까지 전송할 수 있습니다.`, "error");
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
    patchRoomFeedLatestMessage({
      lastMessage: toRoomFeedPreviewFromPendingMessage(pendingMessage),
      lastMessageAt: pendingMessage.sentAt,
    });

    chatStompSession.sendMessage({
      idempotencyKey,
      roomId,
      messageType: "TEXT",
      content,
      imageKeys: [],
    });
  }, [createPendingMessage, draftMessage, patchRoomFeedLatestMessage, roomId, showToast]);

  const handleImageSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;

      const idempotencyKey = createIdempotencyKey();
      try {
        const { uploadUrl, imageKey } = await requestPresignedUrl("MESSAGES");
        await uploadToPresignedUrl(uploadUrl, file);

        const pendingMessage = createPendingMessage({
          messageType: "IMAGE",
          content: file.name || "이미지 전송 중...",
          imageUrls: [],
        });
        setPendingMessages((prev) => new Map(prev).set(idempotencyKey, pendingMessage));
        patchRoomFeedLatestMessage({
          lastMessage: toRoomFeedPreviewFromPendingMessage(pendingMessage),
          lastMessageAt: pendingMessage.sentAt,
        });

        chatStompSession.sendMessage({
          idempotencyKey,
          roomId,
          messageType: "IMAGE",
          content: null,
          imageKeys: [imageKey],
        });
      } catch (error) {
        console.error("[chat-room] 이미지 메시지 전송 준비 실패", error);
        showToast("이미지 업로드에 실패했습니다.", "error");
      }
    },
    [createPendingMessage, patchRoomFeedLatestMessage, roomId, showToast],
  );

  const handleToggleExtraMenu = useCallback(() => {
    setIsExtraMenuOpen((prev) => !prev);
  }, []);

  return {
    messages,
    myLastSeenMessageId,
    isLoading: (!isInteractiveReady || chatMessagesQuery.isLoading) && messages.length === 0,
    isError: chatMessagesQuery.isError,
    hasMore: chatMessagesQuery.hasMore,
    isFetchingMore: chatMessagesQuery.isFetchingMore,
    loadMore: chatMessagesQuery.loadMore,
    draftMessage,
    isExtraMenuOpen,
    isSendDisabled:
      draftMessage.trim().length === 0 || draftMessage.trim().length > CHAT_ROOM_MESSAGE_MAX_LENGTH,
    handleDraftMessageChange,
    handleSendTextMessage,
    handleImageSelect,
    handleToggleExtraMenu,
  };
}
