"use client";

import { useEffect, useRef, useState } from "react";

import type { ChatMessageItemVM } from "@/entities/chat-room";
import { InfiniteScrollSentinel } from "@/shared/ui";

import { ChatMessageFeedSkeleton } from "./ChatMessageFeedSkeleton";
import { ChatMessageItem } from "./ChatMessageItem";

interface ChatMessageFeedProps {
  messages: ChatMessageItemVM[];
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  isFetchingMore: boolean;
  onLoadMore: () => void;
}

export function ChatMessageFeed({
  messages,
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
      {messages.map((message) => (
        <ChatMessageItem
          key={`${message.messageId}-${message.sentAt}`}
          message={message}
        />
      ))}
      <div ref={bottomRef} />
    </section>
  );
}
