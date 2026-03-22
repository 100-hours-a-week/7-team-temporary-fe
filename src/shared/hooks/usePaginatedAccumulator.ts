"use client";

import { useCallback, useRef, useState } from "react";

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
 *
 * ### 동기 처리 설계
 * useEffect 대신 렌더 타임에 ref를 직접 갱신해 데이터를 즉시 반영한다.
 * HydrationBoundary는 useMemo로 동기 hydration하므로 첫 렌더에 data가 이미 존재하며,
 * 서버/클라이언트 모두 동일한 조건에서 동일한 값을 계산 → hydration mismatch 없음.
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
  // 최신 함수 참조를 렌더 타임에 동기 갱신 (useEffect 불필요)
  const getKeyRef = useRef(getKey);
  const sortRef = useRef(sort);
  getKeyRef.current = getKey;
  sortRef.current = sort;

  // 누적 상태를 ref로 관리 — 렌더 타임 동기 갱신용
  const fetchedItemsRef = useRef<TItem[]>([]);
  const totalPagesRef = useRef<number | null>(null);
  const lastDataRef = useRef<PaginatedData<TItem> | undefined>(undefined);
  const lastPageRef = useRef<number | null>(null);

  // reset() 호출 시 리렌더를 강제하기 위한 카운터
  const [, forceRender] = useState(0);

  // 렌더 타임 동기 처리: data나 currentPage가 바뀌었을 때만 실행 (멱등)
  if (enabled && data && (data !== lastDataRef.current || currentPage !== lastPageRef.current)) {
    lastDataRef.current = data;
    lastPageRef.current = currentPage;
    totalPagesRef.current = data.totalPages;

    const base = currentPage === initialPage ? [] : fetchedItemsRef.current;
    const merged = new Map(base.map((item) => [getKeyRef.current(item), item]));
    data.content.forEach((item) => merged.set(getKeyRef.current(item), item));
    const result = Array.from(merged.values());
    fetchedItemsRef.current = sortRef.current ? [...result].sort(sortRef.current) : result;
  }

  const fetchedItems = fetchedItemsRef.current;
  const totalPages = totalPagesRef.current;

  const hasMore =
    totalPages === null ? (data?.content.length ?? 0) === pageSize : currentPage < totalPages;

  const reset = useCallback(() => {
    fetchedItemsRef.current = [];
    totalPagesRef.current = null;
    lastDataRef.current = undefined;
    lastPageRef.current = null;
    forceRender((n) => n + 1);
  }, []);

  const isDataProcessed = totalPages !== null;

  return {
    fetchedItems,
    hasMore,
    /** 처음 로딩 시에만 true. 페이징 중에는 false → 기존 목록이 유지됨 */
    isInitialLoading: enabled && !isDataProcessed && (isLoading || data !== undefined),
    isFetching: enabled && isFetching,
    isError: enabled && isError,
    reset,
  };
}
