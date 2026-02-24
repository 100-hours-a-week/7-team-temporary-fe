import { useEffect, useMemo, useState } from "react";

import {
  CHAT_ROOM_WEBSOCKET_MOCK_ENABLED,
  getMockRealtimeStateSnapshot,
  subscribeMockChatRoomRealtime,
  type MockRealtimeEntry,
} from "../api";

interface UseChatRoomRealtimeMockOptions {
  enabled?: boolean;
  roomIds?: number[];
  intervalMs?: number;
}

export function useChatRoomRealtimeMock({
  enabled = true,
  roomIds,
  intervalMs,
}: UseChatRoomRealtimeMockOptions = {}) {
  const [realtimeStateMap, setRealtimeStateMap] = useState<Record<number, MockRealtimeEntry>>(() =>
    getMockRealtimeStateSnapshot(roomIds),
  );

  const roomIdsKey = useMemo(
    () => (roomIds?.length ? [...roomIds].sort((a, b) => a - b).join(",") : ""),
    [roomIds],
  );

  useEffect(() => {
    setRealtimeStateMap(getMockRealtimeStateSnapshot(roomIds));
  }, [roomIds, roomIdsKey]);

  useEffect(() => {
    if (!enabled) return;

    return subscribeMockChatRoomRealtime(
      (message) => {
        setRealtimeStateMap((prev) => ({
          ...prev,
          [message.roomId]: {
            lastMessage: message.lastMessage,
            lastMessageAt: message.lastMessageAt,
            unreadCount: message.unreadCount,
          },
        }));
      },
      {
        enabled: CHAT_ROOM_WEBSOCKET_MOCK_ENABLED,
        intervalMs,
        roomIds,
      },
    );
  }, [enabled, intervalMs, roomIds, roomIdsKey]);

  return realtimeStateMap;
}
