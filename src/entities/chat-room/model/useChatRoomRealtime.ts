"use client";

import { useEffect, useRef, useState } from "react";

import { chatStompSession } from "@/shared/socket";

import { messageCreatedPayloadToVM } from "./chatMessage.mapper";
import type { ChatMessageItemVM } from "./types";

interface UseChatRoomRealtimeOptions {
  roomId: number;
  participantId?: number;
  myUserId?: number;
  enabled?: boolean;
}

export function useChatRoomRealtime({
  roomId,
  participantId,
  myUserId = 0,
  enabled = true,
}: UseChatRoomRealtimeOptions) {
  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessageItemVM[]>([]);
  const myUserIdRef = useRef(myUserId);
  myUserIdRef.current = myUserId;

  useEffect(() => {
    if (!enabled || roomId <= 0) return;

    return chatStompSession.subscribeToRoom({
      roomId,
      participantId,
      onMessageCreated: (payload) => {
        const vm = messageCreatedPayloadToVM(payload, myUserIdRef.current);
        setRealtimeMessages((prev) => [...prev, vm]);
      },
    });
  }, [enabled, roomId, participantId]);

  return { realtimeMessages };
}
