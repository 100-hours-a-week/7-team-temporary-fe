"use client";

import { useCallback, useMemo, useRef } from "react";

import { Virtuoso } from "react-virtuoso";

import type { ChatMessageItemVM } from "@/entities/chat-room";

import { ChatMessageFeedSkeleton } from "./ChatMessageFeedSkeleton";
import { ChatMessageItem } from "./ChatMessageItem";

interface ChatMessageFeedProps {
  messages: ChatMessageItemVM[];
  lastSeenMessageId?: number | null;
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  isFetchingMore: boolean;
  onLoadMore: () => void;
}

function ReadDivider() {
  return (
    <div className="my-2 flex items-center gap-3 px-1">
      <span className="h-px flex-1 bg-neutral-200" />
      <span className="shrink-0 text-[11px] font-medium text-neutral-400">
        여기까지 읽으셨습니다
      </span>
      <span className="h-px flex-1 bg-neutral-200" />
    </div>
  );
}

function toDateDividerKey(isoString: string): string | null {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateDividerLabel(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="my-2 flex items-center gap-3 px-1">
      <span className="h-px flex-1 bg-neutral-200" />
      <span className="shrink-0 text-[11px] font-medium text-neutral-400">{label}</span>
      <span className="h-px flex-1 bg-neutral-200" />
    </div>
  );
}

function FetchingMoreHeader() {
  return (
    <div className="pt-2 pb-1 text-center text-xs text-neutral-400">이전 메시지 불러오는 중...</div>
  );
}

function EmptyHeader() {
  return null;
}

function FeedFooter() {
  return <div className="pb-6" />;
}

type MessageFeedRenderItem =
  | {
      kind: "DATE_DIVIDER";
      key: string;
      label: string;
    }
  | {
      kind: "MESSAGE";
      key: string;
      message: ChatMessageItemVM;
      messageIndex: number;
    };

const START_INDEX = 100000;

export function ChatMessageFeed({
  messages,
  lastSeenMessageId,
  isLoading,
  isError,
  hasMore,
  isFetchingMore,
  onLoadMore,
}: ChatMessageFeedProps) {
  const firstIndexRef = useRef<number | null>(null);
  const prevFirstKeyRef = useRef<string | null>(null);
  const prevLengthRef = useRef(0);

  const firstUnreadIndex =
    typeof lastSeenMessageId === "number"
      ? messages.findIndex((message) => message.messageId > lastSeenMessageId)
      : -1;
  const showReadDivider = firstUnreadIndex >= 0;

  const renderItems = useMemo<MessageFeedRenderItem[]>(() => {
    const nextItems: MessageFeedRenderItem[] = [];
    let previousDateKey: string | null = null;

    messages.forEach((message, messageIndex) => {
      const currentDateKey = toDateDividerKey(message.sentAt);
      if (currentDateKey && currentDateKey !== previousDateKey) {
        nextItems.push({
          kind: "DATE_DIVIDER",
          key: `date-divider-${currentDateKey}-first-${message.messageId}`,
          label: formatDateDividerLabel(message.sentAt),
        });
        previousDateKey = currentDateKey;
      }

      nextItems.push({
        kind: "MESSAGE",
        key: `message-${message.messageId}`,
        message,
        messageIndex,
      });
    });

    return nextItems;
  }, [messages]);

  // firstItemIndex를 렌더 시점에 동기적으로 계산 (useEffect + setState로 인한 이중 렌더 방지)
  let firstItemIndex = START_INDEX;
  if (renderItems.length > 0) {
    const firstKey = renderItems[0].key;

    if (firstIndexRef.current === null) {
      firstIndexRef.current = START_INDEX - renderItems.length;
    } else if (firstKey !== prevFirstKeyRef.current && renderItems.length > prevLengthRef.current) {
      firstIndexRef.current -= renderItems.length - prevLengthRef.current;
    }

    firstItemIndex = firstIndexRef.current;
    prevFirstKeyRef.current = firstKey;
    prevLengthRef.current = renderItems.length;
  }

  const components = useMemo(
    () => ({
      Header: isFetchingMore ? FetchingMoreHeader : EmptyHeader,
      Footer: FeedFooter,
    }),
    [isFetchingMore],
  );

  const itemContent = useCallback(
    (_: number, item: MessageFeedRenderItem) => {
      if (item.kind === "DATE_DIVIDER") {
        return <DateDivider label={item.label} />;
      }

      return (
        <div className="pb-3">
          {showReadDivider && item.messageIndex === firstUnreadIndex ? <ReadDivider /> : null}
          <ChatMessageItem message={item.message} />
        </div>
      );
    },
    [showReadDivider, firstUnreadIndex],
  );

  const startReached = useCallback(() => {
    if (hasMore && !isFetchingMore) onLoadMore();
  }, [hasMore, isFetchingMore, onLoadMore]);

  if (isLoading) {
    return <ChatMessageFeedSkeleton />;
  }

  if (isError && messages.length === 0) {
    return (
      <div className="rounded-2xl px-4 py-6 text-center text-sm text-neutral-500">
        메시지 목록을 불러오지 못했습니다.
      </div>
    );
  }

  if (messages.length === 0) {
    return <section className="pb-6" />;
  }

  return (
    <Virtuoso
      style={{ height: "100%" }}
      firstItemIndex={firstItemIndex}
      initialTopMostItemIndex={renderItems.length - 1}
      data={renderItems}
      followOutput="auto"
      startReached={startReached}
      itemContent={itemContent}
      components={components}
    />
  );
}
