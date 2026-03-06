import { useCallback, useMemo } from "react";

import { useInfiniteQuery, type QueryKey } from "@tanstack/react-query";

export interface OffsetPage<TItem> {
  content: TItem[];
  page: number;
  size: number;
  totalPages: number;
}

interface UseOffsetInfiniteQueryOptions<
  TItem,
  TPage extends OffsetPage<TItem>,
  TQueryKey extends QueryKey = QueryKey,
> {
  queryKey: TQueryKey;
  size: number;
  enabled?: boolean;
  initialPage?: number;
  staleTime?: number;
  gcTime?: number;
  getItemKey?: (item: TItem) => string | number;
  queryFn: (params: { page: number; size: number; signal?: AbortSignal }) => Promise<TPage>;
}

function dedupeItems<TItem>(
  items: TItem[],
  getItemKey?: (item: TItem) => string | number,
): TItem[] {
  if (!getItemKey) return items;

  const merged = new Map<string | number, TItem>();
  items.forEach((item) => merged.set(getItemKey(item), item));
  return Array.from(merged.values());
}

export function useOffsetInfiniteQuery<
  TItem,
  TPage extends OffsetPage<TItem>,
  TQueryKey extends QueryKey = QueryKey,
>({
  queryKey,
  size,
  enabled = true,
  initialPage = 1,
  staleTime,
  gcTime,
  getItemKey,
  queryFn,
}: UseOffsetInfiniteQueryOptions<TItem, TPage, TQueryKey>) {
  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: initialPage,
    queryFn: ({ pageParam, signal }) => {
      const page = Number(pageParam ?? initialPage);
      return queryFn({ page, size, signal });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page >= lastPage.totalPages) return undefined;
      return lastPage.page + 1;
    },
    enabled,
    staleTime,
    gcTime,
  });

  const pages = query.data?.pages;
  const items = useMemo(() => {
    const flattened = pages?.flatMap((page) => page.content) ?? [];
    return dedupeItems(flattened, getItemKey);
  }, [getItemKey, pages]);

  const loadMore = useCallback(() => {
    if (!query.hasNextPage) return;
    if (query.isFetchingNextPage) return;
    void query.fetchNextPage();
  }, [query.fetchNextPage, query.hasNextPage, query.isFetchingNextPage]);

  return {
    ...query,
    items,
    hasMore: query.hasNextPage ?? false,
    isFetchingMore: query.isFetchingNextPage,
    loadMore,
  };
}
