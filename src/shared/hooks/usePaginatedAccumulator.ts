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
  /**
   * true(기본값): Suspense fallback과의 hydration mismatch 방지를 위해
   *   클라이언트 마운트 전까지 skeleton을 반환한다.
   * false: SSR에서 실데이터를 바로 렌더한다. Suspense fallback 없이
   *   blocking SSR을 사용하는 페이지에서만 사용할 것.
   */
  ssrSkeleton?: boolean;
}

/**
 * 페이지네이션 쿼리 결과를 누적 리스트로 관리하는 공통 훅.
 *
 * - `isInitialLoading`: 누적 데이터가 없을 때만 true (페이징 중에는 false → 기존 목록 유지)
 * - `reset`: 키워드/탭 변경 등 외부 조건이 바뀔 때 누적 상태를 초기화
 *
 * ### 동기 처리 설계
 * 클라이언트 마운트 이후에는 렌더 타임에 ref를 직접 갱신해 데이터를 즉시 반영한다.
 * 마운트 전(SSR + 첫 hydration)에는 데이터를 처리하지 않아 서버/클라이언트 초기 렌더가
 * 모두 skeleton을 반환 → Suspense fallback과 일치 → hydration mismatch 없음.
 * 마운트 후 setIsClientMounted(true) 한 번의 re-render만으로 즉시 데이터가 반영된다.
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
  ssrSkeleton = true,
}: UsePaginatedAccumulatorOptions<TItem>) {
  // 최신 함수 참조를 렌더 타임에 동기 갱신 (useEffect 불필요)
  const getKeyRef = useRef(getKey);
  const sortRef = useRef(sort);
  getKeyRef.current = getKey;
  sortRef.current = sort;

  // 누적 상태를 단일 ref로 관리 — 원자적 갱신으로 동시성 렌더 중 불일치 방지
  const accRef = useRef<{
    fetchedItems: TItem[];
    totalPages: number | null;
    lastData: PaginatedData<TItem> | undefined;
    lastPage: number | null;
  }>({ fetchedItems: [], totalPages: null, lastData: undefined, lastPage: null });

  // reset() 호출 시 리렌더를 강제하기 위한 카운터
  const [, forceRender] = useState(0);

  // ssrSkeleton=true: Suspense fallback과 hydration mismatch 방지를 위해 마운트 전 skeleton 유지.
  // ssrSkeleton=false: blocking SSR 페이지에서 서버/클라이언트 모두 실데이터로 렌더 → skeleton 불필요.
  const [isClientMounted, setIsClientMounted] = useState(!ssrSkeleton);
  useEffect(() => {
    if (ssrSkeleton) setIsClientMounted(true);
  }, [ssrSkeleton]);

  // 렌더 타임 동기 처리: 활성화 조건 충족 후 data나 currentPage가 바뀌었을 때만 실행 (멱등)
  if (
    isClientMounted &&
    enabled &&
    data &&
    (data !== accRef.current.lastData || currentPage !== accRef.current.lastPage)
  ) {
    const base = currentPage === initialPage ? [] : accRef.current.fetchedItems;
    const merged = new Map(base.map((item) => [getKeyRef.current(item), item]));
    data.content.forEach((item) => merged.set(getKeyRef.current(item), item));
    const result = Array.from(merged.values());
    // 단일 할당으로 원자적 업데이트
    accRef.current = {
      fetchedItems: sortRef.current ? [...result].sort(sortRef.current) : result,
      totalPages: data.totalPages,
      lastData: data,
      lastPage: currentPage,
    };
  }

  const fetchedItems = accRef.current.fetchedItems;
  const totalPages = accRef.current.totalPages;

  const hasMore =
    totalPages === null ? (data?.content.length ?? 0) === pageSize : currentPage < totalPages;

  const reset = useCallback(() => {
    accRef.current = { fetchedItems: [], totalPages: null, lastData: undefined, lastPage: null };
    forceRender((n) => n + 1);
  }, []);

  const isDataProcessed = accRef.current.totalPages !== null;

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
