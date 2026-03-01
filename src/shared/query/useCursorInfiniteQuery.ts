import { useInfiniteQuery, type QueryKey } from "@tanstack/react-query";

type CursorValue = string | number;

export interface CursorPage<TItem, TCursor extends CursorValue = number> {
  content: TItem[];
  nextCursor: TCursor | null;
  hasNext: boolean;
  size: number;
}

interface UseCursorInfiniteQueryOptions<
  TItem,
  TPage extends CursorPage<TItem, TCursor>,
  TCursor extends CursorValue = number,
  TQueryKey extends QueryKey = QueryKey,
> {
  queryKey: TQueryKey;
  enabled?: boolean;
  initialCursor?: TCursor | null;
  staleTime?: number;
  gcTime?: number;
  queryFn: (params: { cursor?: TCursor; signal?: AbortSignal }) => Promise<TPage>;
}

export function useCursorInfiniteQuery<
  TItem,
  TPage extends CursorPage<TItem, TCursor>,
  TCursor extends CursorValue = number,
  TQueryKey extends QueryKey = QueryKey,
>({
  queryKey,
  enabled = true,
  initialCursor = null,
  staleTime,
  gcTime,
  queryFn,
}: UseCursorInfiniteQueryOptions<TItem, TPage, TCursor, TQueryKey>) {
  return useInfiniteQuery({
    queryKey,
    initialPageParam: initialCursor,
    queryFn: ({ pageParam, signal }) => {
      const cursor = (pageParam ?? undefined) as TCursor | undefined;
      return queryFn({ cursor, signal });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext) return undefined;
      return lastPage.nextCursor ?? undefined;
    },
    enabled,
    staleTime,
    gcTime,
  });
}
