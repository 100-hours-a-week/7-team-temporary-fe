"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ChatRoomListItemVM } from "@/entities/chat-room";
import { useGroupChatRoomListQuery } from "@/entities/chat-room";
import { usePaginatedAccumulator, useInfiniteScrollTrigger } from "@/shared/hooks";
import { chatStompSession } from "@/shared/socket";
import { FloatingActionButton, FloatingActionDock } from "@/shared/ui/button";
import { SectionTabs, type SectionTab } from "@/shared/ui/section-tabs";

import { ChatRoomList } from "./ChatRoomList";

const ROOM_SECTION = {
  GROUP_CHAT: "GROUP_CHAT",
} as const;

type RoomSection = (typeof ROOM_SECTION)[keyof typeof ROOM_SECTION];

const ROOM_TABS: ReadonlyArray<SectionTab<RoomSection>> = [
  { id: ROOM_SECTION.GROUP_CHAT, label: "그룹 채팅방" },
];

const CHAT_ROOM_LIST_PAGE = 1;
const CHAT_ROOM_LIST_SIZE = 10;

interface RoomFeedProps {
  enabled?: boolean;
  onChatRoomClick?: (roomId: number) => void;
  onChatSearchClick?: () => void;
}

function isPatchResolvedByServer(
  room: ChatRoomListItemVM,
  patch: Partial<ChatRoomListItemVM>,
): boolean {
  const unreadSynced =
    patch.unreadCount === undefined ||
    room.unreadCount === patch.unreadCount ||
    room.unreadCount === 0;
  const participantsSynced =
    patch.participantsCount === undefined || room.participantsCount === patch.participantsCount;
  const lastMessageSynced =
    patch.lastMessage === undefined || room.lastMessage === patch.lastMessage;
  const lastMessageAtSynced =
    patch.lastMessageAt === undefined || room.lastMessageAt === patch.lastMessageAt;

  if (unreadSynced && participantsSynced && lastMessageSynced && lastMessageAtSynced) {
    return true;
  }

  if (
    typeof patch.lastMessageAt === "string" &&
    typeof room.lastMessageAt === "string" &&
    Number.isFinite(Date.parse(patch.lastMessageAt)) &&
    Number.isFinite(Date.parse(room.lastMessageAt))
  ) {
    return Date.parse(room.lastMessageAt) >= Date.parse(patch.lastMessageAt);
  }

  return false;
}

export function RoomFeed({ enabled = true, onChatRoomClick, onChatSearchClick }: RoomFeedProps) {
  const [activeSection, setActiveSection] = useState<RoomSection>(ROOM_SECTION.GROUP_CHAT);
  const [currentPage, setCurrentPage] = useState(CHAT_ROOM_LIST_PAGE);
  const [roomRealtimePatches, setRoomRealtimePatches] = useState<
    Record<number, Partial<ChatRoomListItemVM>>
  >({});
  const [forcedReadRoomIds, setForcedReadRoomIds] = useState<Record<number, true>>({});
  const previousUnreadByRoomRef = useRef<Record<number, number>>({});
  const scrollRef = useRef<HTMLElement>(null);

  const isGroupChatSection = activeSection === ROOM_SECTION.GROUP_CHAT;
  const groupChatQuery = useGroupChatRoomListQuery({
    enabled: enabled && isGroupChatSection,
    page: currentPage,
    size: CHAT_ROOM_LIST_SIZE,
  });

  const {
    fetchedItems: rooms,
    hasMore,
    isInitialLoading,
    isFetching,
    isError,
  } = usePaginatedAccumulator<ChatRoomListItemVM>({
    data: groupChatQuery.data,
    isLoading: groupChatQuery.isLoading,
    isFetching: groupChatQuery.isFetching,
    isError: groupChatQuery.isError,
    currentPage,
    initialPage: CHAT_ROOM_LIST_PAGE,
    pageSize: CHAT_ROOM_LIST_SIZE,
    getKey: (item) => item.roomId,
    enabled: enabled && isGroupChatSection,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeSection]);

  const patchedRooms = useMemo(
    () =>
      rooms.map((room) => {
        const patch = roomRealtimePatches[room.roomId];
        const merged = patch ? { ...room, ...patch } : room;

        if (forcedReadRoomIds[room.roomId]) {
          return {
            ...merged,
            unreadCount: 0,
          };
        }

        return merged;
      }),
    [forcedReadRoomIds, roomRealtimePatches, rooms],
  );

  useEffect(() => {
    setForcedReadRoomIds((prev) => {
      let changed = false;
      const next = { ...prev };

      rooms.forEach((room) => {
        const previousUnread = previousUnreadByRoomRef.current[room.roomId];
        if (previousUnread > 0 && room.unreadCount === 0 && !next[room.roomId]) {
          next[room.roomId] = true;
          changed = true;
        }
      });

      return changed ? next : prev;
    });

    const nextPreviousUnread: Record<number, number> = {};
    rooms.forEach((room) => {
      nextPreviousUnread[room.roomId] = room.unreadCount;
    });
    previousUnreadByRoomRef.current = nextPreviousUnread;
  }, [rooms]);

  // REST 재조회가 반영되면 서버 값과 동기화된 room patch만 선택적으로 비운다.
  useEffect(() => {
    if (!groupChatQuery.data?.content.length) return;
    setRoomRealtimePatches((prev) => {
      let changed = false;
      const next = { ...prev };

      groupChatQuery.data.content.forEach((room) => {
        const patch = next[room.roomId];
        if (!patch) return;
        if (!isPatchResolvedByServer(room, patch)) return;
        delete next[room.roomId];
        changed = true;
      });

      return changed ? next : prev;
    });
  }, [groupChatQuery.data]);

  // unreadChanged: 옵티미스틱 패치만 적용. HTTP 재요청은 채팅방 퇴장 시점에 발생.
  useEffect(() => {
    if (!enabled || !isGroupChatSection) return;

    const unsubscribeUnread = chatStompSession.onUnreadChanged((payload) => {
      if (typeof payload.unreadCount === "number") {
        if (payload.unreadCount > 0) {
          setForcedReadRoomIds((prev) => {
            if (!prev[payload.roomId]) return prev;
            const next = { ...prev };
            delete next[payload.roomId];
            return next;
          });
        } else if (payload.unreadCount === 0) {
          setForcedReadRoomIds((prev) => {
            if (prev[payload.roomId]) return prev;
            return {
              ...prev,
              [payload.roomId]: true,
            };
          });
        }
      }

      setRoomRealtimePatches((prev) => {
        const nextPatch: Partial<ChatRoomListItemVM> = {};
        if (typeof payload.unreadCount === "number") {
          nextPatch.unreadCount = payload.unreadCount;
        }
        if (typeof payload.participantsCount === "number") {
          nextPatch.participantsCount = payload.participantsCount;
        }
        if (typeof payload.lastUserMessagePreview === "string") {
          nextPatch.lastMessage = payload.lastUserMessagePreview;
        } else if (payload.lastUserMessagePreview === null) {
          nextPatch.lastMessage = undefined;
        }
        if (typeof payload.lastUserMessageSentAt === "string") {
          nextPatch.lastMessageAt = payload.lastUserMessageSentAt;
        } else if (payload.lastUserMessageSentAt === null) {
          nextPatch.lastMessageAt = undefined;
        }

        if (Object.keys(nextPatch).length === 0) return prev;

        return {
          ...prev,
          [payload.roomId]: {
            ...(prev[payload.roomId] ?? {}),
            ...nextPatch,
          },
        };
      });
    });

    return () => {
      unsubscribeUnread();
    };
  }, [enabled, isGroupChatSection]);

  const loadMore = useCallback(() => {
    if (!enabled) return;
    if (!isGroupChatSection) return;
    if (!hasMore) return;
    if (groupChatQuery.isFetching) return;

    setCurrentPage((prev) => prev + 1);
  }, [enabled, groupChatQuery.isFetching, hasMore, isGroupChatSection]);

  const { loadMoreRef } = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled: enabled && isGroupChatSection,
    hasMore,
    isFetching,
    onLoadMore: loadMore,
    rootRef: scrollRef,
  });

  return (
    <section
      ref={scrollRef}
      className="scrollbar-hide h-full overflow-y-auto px-6 pb-[90px]"
    >
      <SectionTabs
        tabs={ROOM_TABS}
        activeTab={activeSection}
        onChange={setActiveSection}
      />

      {isInitialLoading ? (
        <div className="mt-4 rounded-2xl px-4 py-6 text-center text-sm text-neutral-500">
          채팅방 목록을 불러오는 중...
        </div>
      ) : null}

      {isError ? (
        <div className="mt-4 rounded-2xl px-4 py-6 text-center text-sm text-neutral-500">
          채팅방 목록을 불러오지 못했습니다.
        </div>
      ) : null}

      {!isInitialLoading && !isError ? (
        <ChatRoomList
          items={patchedRooms}
          onChatRoomClick={onChatRoomClick ?? (() => undefined)}
        />
      ) : null}

      {!isInitialLoading && !isError && isGroupChatSection ? (
        <>
          <div
            ref={loadMoreRef}
            className="h-px"
          />
          {isFetching && hasMore ? (
            <div className="pt-2 text-center text-xs text-neutral-400">불러오는 중...</div>
          ) : null}
        </>
      ) : null}

      {isGroupChatSection && (
        <FloatingActionDock>
          <FloatingActionButton
            icon="chat_single"
            label="채팅방 찾기"
            onClick={onChatSearchClick}
          />
        </FloatingActionDock>
      )}
    </section>
  );
}
