"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface PaginatedData<TItem> {
  content: TItem[];
  totalPages: number;
}

interface UsePaginatedAccumulatorOptions<TItem> {
  data: PaginatedData<TItem> | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError?: boolean;
  currentPage: number;
  initialPage?: number;
  pageSize: number;
  getKey: (item: TItem) => string | number;
  sort?: (a: TItem, b: TItem) => number;
  enabled?: boolean;
}

/**
 * 페이지네이션 쿼리 결과를 누적 리스트로 관리하는 공통 훅.
 *
 * - `isInitialLoading`: 누적 데이터가 없을 때만 true (페이징 중에는 false → 기존 목록 유지)
 * - `reset`: 키워드/탭 변경 등 외부 조건이 바뀔 때 누적 상태를 초기화
 */
export function usePaginatedAccumulator<TItem>({
  data,
  isLoading,
  isFetching,
  isError = false,
  currentPage,
  initialPage = 1,
  pageSize,
  getKey,
  sort,
  enabled = true,
}: UsePaginatedAccumulatorOptions<TItem>) {
  const [fetchedItems, setFetchedItems] = useState<TItem[]>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  // 매 렌더마다 새 참조가 생성되는 함수를 ref로 안정화 → useEffect 무한 루프 방지
  const getKeyRef = useRef(getKey);
  const sortRef = useRef(sort);
  useEffect(() => {
    getKeyRef.current = getKey;
  });
  useEffect(() => {
    sortRef.current = sort;
  });

  useEffect(() => {
    if (!enabled) return;
    if (!data) return;

    setTotalPages(data.totalPages);
    setFetchedItems((prev) => {
      const base = currentPage === initialPage ? [] : prev;
      const merged = new Map(base.map((item) => [getKeyRef.current(item), item]));
      data.content.forEach((item) => merged.set(getKeyRef.current(item), item));
      const result = Array.from(merged.values());
      return sortRef.current ? [...result].sort(sortRef.current) : result;
    });
  }, [currentPage, data, enabled, initialPage]);

  const hasMore =
    totalPages === null ? (data?.content.length ?? 0) === pageSize : currentPage < totalPages;

  const reset = useCallback(() => {
    setFetchedItems([]);
    setTotalPages(null);
  }, []);

  return {
    fetchedItems,
    hasMore,
    /** 처음 로딩 시에만 true. 페이징 중에는 false → 기존 목록이 유지됨 */
    isInitialLoading: enabled && isLoading && fetchedItems.length === 0,
    isFetching: enabled && isFetching,
    isError: enabled && isError,
    reset,
  };
}
