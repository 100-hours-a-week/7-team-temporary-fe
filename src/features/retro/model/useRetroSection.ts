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

const RETRO_LIST_PAGE = 1;
const RETRO_LIST_SIZE = 10;

/**
 * 회고 피드 탭 상태와 MY_PAGE 목록 페이징을 함께 관리하는 훅.
 *
 * - MY_PAGE 탭: API(useMyRetrosQuery)로 페이지를 불러오고 id 기준으로 누적/중복 제거
 * - EXPLORE 탭: API(usePublicRetrosQuery)로 공개 회고 목록(isOpen=true)을 페이징 조회
 * - loadMore: 다음 페이지 요청이 가능한 경우에만 currentPage를 증가시켜 무한 스크롤을 지원
 */
export function useRetroSection(initialSection: RetroSection = RETRO_SECTION.MY_PAGE) {
  const [activeSection, setActiveSection] = useState<RetroSection>(initialSection);
  const [currentPage, setCurrentPage] = useState(RETRO_LIST_PAGE);
  const [fetchedRetros, setFetchedRetros] = useState<Array<MyRetroCardVM | PublicRetroCardVM>>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const isMyPage = activeSection === RETRO_SECTION.MY_PAGE;

  const myRetrosQuery = useMyRetrosQuery({
    page: currentPage,
    size: RETRO_LIST_SIZE,
    enabled: isMyPage,
  });

  const publicRetrosQuery = usePublicRetrosQuery({
    isOpen: true,
    page: currentPage,
    size: RETRO_LIST_SIZE,
    enabled: !isMyPage,
  });

  const currentQuery = isMyPage ? myRetrosQuery : publicRetrosQuery;

  useEffect(() => {
    setCurrentPage(RETRO_LIST_PAGE);
    setFetchedRetros([]);
    setTotalPages(null);
  }, [activeSection]);

  useEffect(() => {
    if (!currentQuery.data) return;

    setTotalPages(currentQuery.data.totalPages);
    setFetchedRetros((prev) => {
      const base = currentPage === RETRO_LIST_PAGE ? [] : prev;
      const merged = new Map(base.map((item) => [item.id, item]));
      currentQuery.data.content.forEach((item) => merged.set(item.id, item));
      return Array.from(merged.values());
    });
  }, [currentPage, currentQuery.data]);

  const hasMore =
    totalPages === null
      ? (currentQuery.data?.content.length ?? 0) === RETRO_LIST_SIZE
      : currentPage < totalPages;

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    if (currentQuery.isFetching) return;
    setCurrentPage((prev) => prev + 1);
  }, [currentQuery.isFetching, hasMore]);

  const retros = useMemo(() => fetchedRetros, [fetchedRetros]);

  return {
    activeSection,
    setActiveSection,
    retros,
    isMyPage,
    isLoading: currentQuery.isLoading,
    isError: currentQuery.isError,
    isFetching: currentQuery.isFetching,
    hasMore,
    loadMore,
  };
}
