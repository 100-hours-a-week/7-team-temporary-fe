"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import type { ChatRoomListItemVM } from "@/entities/chat-room";
import { chatRoomQueryKeys, useGroupChatRoomListQuery } from "@/entities/chat-room";
import { usePaginatedAccumulator, useInfiniteScrollTrigger } from "@/shared/hooks";
import { chatStompSession } from "@/shared/socket";
import { useStackPage } from "@/widgets/stack";

import { isPatchResolvedByServer } from "../model/realtimePatch";
import { ChatRoomList } from "./ChatRoomList";

const CHAT_ROOM_LIST_PAGE = 1;
const CHAT_ROOM_LIST_SIZE = 10;

interface OpenChatSectionProps {
  enabled: boolean;
  onRoomClick: (roomId: number) => void;
  scrollRef: React.RefObject<HTMLElement | null>;
}

export function OpenChatSection({ enabled, onRoomClick, scrollRef }: OpenChatSectionProps) {
  const { depth } = useStackPage();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(CHAT_ROOM_LIST_PAGE);
  const [roomRealtimePatches, setRoomRealtimePatches] = useState<
    Record<number, Partial<ChatRoomListItemVM>>
  >({});
  const [forcedReadRoomIds, setForcedReadRoomIds] = useState<Record<number, true>>({});
  const previousUnreadByRoomRef = useRef<Record<number, number>>({});
  const previousStackDepthRef = useRef(depth);

  const roomListQuery = useGroupChatRoomListQuery({
    enabled,
    page: currentPage,
    size: CHAT_ROOM_LIST_SIZE,
    staleTime: 5 * 60 * 1000,
  });

  const {
    fetchedItems: rooms,
    hasMore,
    isInitialLoading,
    isFetching,
    isError,
  } = usePaginatedAccumulator<ChatRoomListItemVM>({
    data: roomListQuery.data,
    isLoading: roomListQuery.isLoading,
    isFetching: roomListQuery.isFetching,
    isError: roomListQuery.isError,
    currentPage,
    initialPage: CHAT_ROOM_LIST_PAGE,
    pageSize: CHAT_ROOM_LIST_SIZE,
    getKey: (item) => item.roomId,
    enabled,
  });

  // 섹션 마운트 시 스크롤 초기화
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 채팅방에서 돌아올 때 목록 재조회
  useEffect(() => {
    const previousDepth = previousStackDepthRef.current;
    previousStackDepthRef.current = depth;

    if (!enabled) return;
    if (previousDepth <= 0 || depth !== 0) return;

    setCurrentPage(CHAT_ROOM_LIST_PAGE);
    void queryClient.invalidateQueries({ queryKey: chatRoomQueryKeys.listAll() });
  }, [depth, enabled, queryClient]);

  const patchedRooms = useMemo(
    () =>
      rooms.map((room) => {
        const patch = roomRealtimePatches[room.roomId];
        const merged = patch ? { ...room, ...patch } : room;

        if (forcedReadRoomIds[room.roomId]) {
          return { ...merged, unreadCount: 0 };
        }

        return merged;
      }),
    [forcedReadRoomIds, roomRealtimePatches, rooms],
  );

  // forcedReadRoomIds: 서버 재조회로 unreadCount가 0이 되면 강제 읽음 처리
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

  // REST 재조회가 반영되면 서버 값과 동기화된 patch만 선택적으로 제거
  useEffect(() => {
    if (!roomListQuery.data?.content.length) return;
    setRoomRealtimePatches((prev) => {
      let changed = false;
      const next = { ...prev };

      roomListQuery.data.content.forEach((room) => {
        const patch = next[room.roomId];
        if (!patch) return;
        if (!isPatchResolvedByServer(room, patch)) return;
        delete next[room.roomId];
        changed = true;
      });

      return changed ? next : prev;
    });
  }, [roomListQuery.data]);

  // unreadChanged: 옵티미스틱 패치만 적용. HTTP 재요청은 채팅방 퇴장 시점에 발생.
  useEffect(() => {
    if (!enabled) return;

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
            return { ...prev, [payload.roomId]: true };
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
          [payload.roomId]: { ...(prev[payload.roomId] ?? {}), ...nextPatch },
        };
      });
    });

    return () => {
      unsubscribeUnread();
    };
  }, [enabled]);

  const loadMore = useCallback(() => {
    if (!enabled || !hasMore || roomListQuery.isFetching) return;
    setCurrentPage((prev) => prev + 1);
  }, [enabled, hasMore, roomListQuery.isFetching]);

  const { loadMoreRef } = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled,
    hasMore,
    isFetching,
    onLoadMore: loadMore,
    rootRef: scrollRef,
  });

  return (
    <>
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
          onChatRoomClick={onRoomClick}
        />
      ) : null}

      {!isInitialLoading && !isError ? (
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
    </>
  );
}
