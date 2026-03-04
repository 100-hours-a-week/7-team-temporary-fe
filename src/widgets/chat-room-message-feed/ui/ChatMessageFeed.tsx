"use client";

import { useEffect, useRef, useState } from "react";

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

  const firstUnreadIndex =
    typeof lastSeenMessageId === "number"
      ? messages.findIndex((message) => message.messageId > lastSeenMessageId)
      : -1;
  const showReadDivider = firstUnreadIndex >= 0;

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
      {messages.map((message, index) => (
        <div key={`${message.messageId}-${message.sentAt}`}>
          {showReadDivider && index === firstUnreadIndex ? <ReadDivider /> : null}
          <ChatMessageItem message={message} />
        </div>
      ))}
      <div ref={bottomRef} />
    </section>
  );
}
