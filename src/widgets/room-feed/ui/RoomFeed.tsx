"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import type { ChatRoomListItemVM } from "@/entities/chat-room";
import { chatRoomQueryKeys, useGroupChatRoomListQuery } from "@/entities/chat-room";
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

export function RoomFeed({ enabled = true, onChatRoomClick, onChatSearchClick }: RoomFeedProps) {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<RoomSection>(ROOM_SECTION.GROUP_CHAT);
  const [currentPage, setCurrentPage] = useState(CHAT_ROOM_LIST_PAGE);
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
    reset,
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

  useEffect(() => {
    setCurrentPage(CHAT_ROOM_LIST_PAGE);
    reset();
  }, [isGroupChatSection, reset]);

  // user queue 이벤트로 목록 요약이 바뀌면 1페이지부터 다시 로드
  useEffect(() => {
    if (!enabled || !isGroupChatSection) return;

    const refreshList = () => {
      setCurrentPage(CHAT_ROOM_LIST_PAGE);
      reset();
      void queryClient.invalidateQueries({ queryKey: chatRoomQueryKeys.searchAll() });
    };

    const unsubscribeSummary = chatStompSession.onChatSummaryChanged(refreshList);
    const unsubscribeUnread = chatStompSession.onUnreadChanged(refreshList);

    return () => {
      unsubscribeSummary();
      unsubscribeUnread();
    };
  }, [enabled, isGroupChatSection, queryClient, reset]);

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
          items={rooms}
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
