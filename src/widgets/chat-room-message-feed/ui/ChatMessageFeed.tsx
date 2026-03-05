"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { ChatMessageItemVM } from "@/entities/chat-room";
import { InfiniteScrollSentinel } from "@/shared/ui";

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

export function ChatMessageFeed({
  messages,
  lastSeenMessageId,
  isLoading,
  isError,
  hasMore,
  isFetchingMore,
  onLoadMore,
}: ChatMessageFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isReadyForLoadMore, setIsReadyForLoadMore] = useState(false);

  const lastMessage = messages[messages.length - 1];
  const latestMessageKey = lastMessage ? `${lastMessage.messageId}-${lastMessage.sentAt}` : null;

  useEffect(() => {
    if (!latestMessageKey) return;
    bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    setIsReadyForLoadMore(true);
  }, [latestMessageKey]);

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
          key: `date-divider-${currentDateKey}-${messageIndex}`,
          label: formatDateDividerLabel(message.sentAt),
        });
        previousDateKey = currentDateKey;
      }

      nextItems.push({
        kind: "MESSAGE",
        key: `message-${message.messageId}-${message.sentAt}-${messageIndex}`,
        message,
        messageIndex,
      });
    });

    return nextItems;
  }, [messages]);

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
    <section className="flex flex-col gap-3 pb-6">
      <InfiniteScrollSentinel
        enabled={isReadyForLoadMore}
        hasMore={hasMore}
        isFetching={isFetchingMore}
        onLoadMore={onLoadMore}
        loadingLabel="이전 메시지 불러오는 중..."
        loadingClassName="pb-1"
      />
      {renderItems.map((item) => {
        if (item.kind === "DATE_DIVIDER") {
          return (
            <div key={item.key}>
              <DateDivider label={item.label} />
            </div>
          );
        }

        return (
          <div key={item.key}>
            {showReadDivider && item.messageIndex === firstUnreadIndex ? <ReadDivider /> : null}
            <ChatMessageItem message={item.message} />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </section>
  );
}
