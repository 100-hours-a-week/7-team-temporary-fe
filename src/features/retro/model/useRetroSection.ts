"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  type MyRetroCardVM,
  type PublicRetroCardVM,
  RETRO_SECTION,
  useMyRetrosQuery,
  usePublicRetrosQuery,
  type RetroSection,
} from "@/entities/retro";
import { usePaginatedAccumulator } from "@/shared/hooks";

const RETRO_LIST_PAGE = 1;
const RETRO_LIST_SIZE = 10;

interface UseRetroSectionOptions {
  enabled?: boolean;
}

/**
 * 회고 피드 탭 상태와 MY_PAGE 목록 페이징을 함께 관리하는 훅.
 *
 * - MY_PAGE 탭: API(useMyRetrosQuery)로 페이지를 불러오고 id 기준으로 누적/중복 제거
 * - EXPLORE 탭: API(usePublicRetrosQuery)로 공개 회고 목록(isOpen=true)을 페이징 조회
 * - loadMore: 다음 페이지 요청이 가능한 경우에만 currentPage를 증가시켜 무한 스크롤을 지원
 */
export function useRetroSection(
  initialSection: RetroSection = RETRO_SECTION.MY_PAGE,
  { enabled = true }: UseRetroSectionOptions = {},
) {
  const [activeSection, setActiveSection] = useState<RetroSection>(initialSection);
  const [currentPage, setCurrentPage] = useState(RETRO_LIST_PAGE);
  const isMyPage = activeSection === RETRO_SECTION.MY_PAGE;

  const myRetrosQuery = useMyRetrosQuery({
    page: currentPage,
    size: RETRO_LIST_SIZE,
    enabled: enabled && isMyPage,
  });

  const publicRetrosQuery = usePublicRetrosQuery({
    isOpen: true,
    page: currentPage,
    size: RETRO_LIST_SIZE,
    enabled: enabled && !isMyPage,
  });

  const currentQuery = isMyPage ? myRetrosQuery : publicRetrosQuery;
  const isBootstrapLoading =
    enabled &&
    !currentQuery.isFetched &&
    (currentQuery.status === "pending" ||
      currentQuery.isLoading ||
      currentQuery.isPending ||
      currentQuery.isFetching);

  const { fetchedItems, hasMore, isInitialLoading, isFetching, isError, reset } =
    usePaginatedAccumulator<MyRetroCardVM | PublicRetroCardVM>({
      data: currentQuery.data,
      isLoading: isBootstrapLoading,
      isFetching: currentQuery.isFetching,
      isError: currentQuery.isError,
      currentPage,
      initialPage: RETRO_LIST_PAGE,
      pageSize: RETRO_LIST_SIZE,
      getKey: (item) => item.id,
      enabled,
    });

  useEffect(() => {
    setCurrentPage(RETRO_LIST_PAGE);
    reset();
  }, [activeSection, reset]);

  const loadMore = useCallback(() => {
    if (!enabled) return;
    if (!hasMore) return;
    if (currentQuery.isFetching) return;
    setCurrentPage((prev) => prev + 1);
  }, [currentQuery.isFetching, enabled, hasMore]);

  const retros = useMemo(() => fetchedItems, [fetchedItems]);

  return {
    activeSection,
    setActiveSection,
    retros,
    isMyPage,
    isLoading: isInitialLoading,
    isError,
    isFetching,
    hasMore,
    loadMore,
  };
}
