import { useCallback, useMemo } from "react";

import { useCursorInfiniteQuery } from "@/shared/query";

import { fetchReportMessages } from "../api";

import { reportQueryKeys } from "./queryKeys";
import { toReportMessageListModel } from "./reportMessage.mapper";
import type { ReportMessageItemVM } from "./types";

const DEFAULT_REPORT_MESSAGE_PAGE_SIZE = 5;

interface UseReportMessagesInfiniteQueryOptions {
  reportId: number;
  size?: number;
  enabled?: boolean;
}

function dedupeAndSortMessages(messages: ReportMessageItemVM[]) {
  const deduped = new Map<number, ReportMessageItemVM>();
  messages.forEach((item) => deduped.set(item.messageId, item));

  return Array.from(deduped.values()).sort((left, right) => {
    const leftTime = new Date(left.sentAt).getTime();
    const rightTime = new Date(right.sentAt).getTime();
    if (leftTime === rightTime) return left.messageId - right.messageId;
    return leftTime - rightTime;
  });
}

export function useReportMessagesInfiniteQuery({
  reportId,
  size = DEFAULT_REPORT_MESSAGE_PAGE_SIZE,
  enabled = true,
}: UseReportMessagesInfiniteQueryOptions) {
  const query = useCursorInfiniteQuery({
    queryKey: reportQueryKeys.messagesInfinite(reportId, size),
    queryFn: async ({ cursor, signal }) => {
      const dto = await fetchReportMessages({ reportId, cursor, size, signal });
      return toReportMessageListModel(dto);
    },
    enabled: enabled && reportId > 0,
  });

  const messages = useMemo(() => {
    const flattened = query.data?.pages.flatMap((page) => page.content) ?? [];
    return dedupeAndSortMessages(flattened);
  }, [query.data?.pages]);

  const loadMore = useCallback(() => {
    if (!query.hasNextPage) return;
    if (query.isFetchingNextPage) return;
    void query.fetchNextPage();
  }, [query]);

  return {
    ...query,
    messages,
    hasMore: query.hasNextPage ?? false,
    isFetchingMore: query.isFetchingNextPage,
    loadMore,
  };
}
