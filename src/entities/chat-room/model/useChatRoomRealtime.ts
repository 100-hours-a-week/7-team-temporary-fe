"use client";

import { useEffect, useRef } from "react";

import { chatStompSession } from "@/shared/socket";

import { messageCreatedPayloadToVM } from "./chatMessage.mapper";
import type { ChatMessageItemVM } from "./types";

interface UseChatRoomRealtimeOptions {
  roomId: number;
  participantId?: number;
  myUserId?: number | null;
  enabled?: boolean;
  onMessage?: (vm: ChatMessageItemVM) => void;
}

export function useChatRoomRealtime({
  roomId,
  participantId,
  myUserId = null,
  enabled = true,
  onMessage,
}: UseChatRoomRealtimeOptions) {
  const myUserIdRef = useRef(myUserId);
  myUserIdRef.current = myUserId;

  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!enabled || roomId <= 0) return;

    return chatStompSession.subscribeToRoom({
      roomId,
      participantId,
      onMessageCreated: (payload) => {
        const vm = messageCreatedPayloadToVM(payload, myUserIdRef.current);
        onMessageRef.current?.(vm);
      },
    });
  }, [enabled, roomId, participantId]);
}
