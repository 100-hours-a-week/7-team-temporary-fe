import { useCallback, useMemo } from "react";

import { useCursorInfiniteQuery } from "@/shared/query";

import { fetchChatRoomMessages } from "../api";

import { toChatMessageListModel } from "./chatMessage.mapper";
import { chatRoomQueryKeys } from "./queryKeys";
import type { ChatMessageItemVM } from "./types";

const DEFAULT_CHAT_ROOM_SIZE = 50;
const DEFAULT_CHAT_ROOM_MY_USER_ID = 3;

interface UseChatRoomMessagesInfiniteQueryOptions {
  roomId: number;
  size?: number;
  myUserId?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

function dedupeAndSortMessages(messages: ChatMessageItemVM[]) {
  const deduped = new Map<number, ChatMessageItemVM>();
  messages.forEach((message) => deduped.set(message.messageId, message));

  return Array.from(deduped.values()).sort((left, right) => {
    const leftTime = new Date(left.sentAt).getTime();
    const rightTime = new Date(right.sentAt).getTime();

    if (leftTime === rightTime) {
      return left.messageId - right.messageId;
    }

    return leftTime - rightTime;
  });
}

export function useChatRoomMessagesInfiniteQuery({
  roomId,
  size = DEFAULT_CHAT_ROOM_SIZE,
  myUserId = DEFAULT_CHAT_ROOM_MY_USER_ID,
  enabled = true,
  staleTime,
  gcTime,
}: UseChatRoomMessagesInfiniteQueryOptions) {
  const query = useCursorInfiniteQuery({
    queryKey: chatRoomQueryKeys.messagesInfinite(roomId, size, myUserId),
    queryFn: async ({ cursor, signal }) => {
      const dto = await fetchChatRoomMessages({ roomId, cursor, size, signal });
      return toChatMessageListModel(dto, { myUserId });
    },
    enabled: enabled && roomId > 0,
    staleTime,
    gcTime,
  });

  const pages = query.data?.pages;
  const messages = useMemo(() => {
    const flattened = pages?.flatMap((page) => page.content) ?? [];
    return dedupeAndSortMessages(flattened);
  }, [pages]);

  const loadMore = useCallback(() => {
    if (!query.hasNextPage) return;
    if (query.isFetchingNextPage) return;
    void query.fetchNextPage();
  }, [query.fetchNextPage, query.hasNextPage, query.isFetchingNextPage]);

  return {
    ...query,
    messages,
    hasMore: query.hasNextPage ?? false,
    isFetchingMore: query.isFetchingNextPage,
    loadMore,
  };
}
