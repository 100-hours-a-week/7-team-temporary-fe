"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  EXPLORE_RETRO_MOCKS,
  type MyRetroCardVM,
  RETRO_SECTION,
  useMyRetrosQuery,
  type RetroSection,
} from "@/entities/retro";

const RETRO_LIST_PAGE = 1;
const RETRO_LIST_SIZE = 10;

export function useRetroSection(initialSection: RetroSection = RETRO_SECTION.MY_PAGE) {
  const [activeSection, setActiveSection] = useState<RetroSection>(initialSection);
  const [currentPage, setCurrentPage] = useState(RETRO_LIST_PAGE);
  const [fetchedRetros, setFetchedRetros] = useState<MyRetroCardVM[]>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const isMyPage = activeSection === RETRO_SECTION.MY_PAGE;

  const myRetrosQuery = useMyRetrosQuery({
    page: currentPage,
    size: RETRO_LIST_SIZE,
    enabled: isMyPage,
  });

  useEffect(() => {
    if (!isMyPage) return;
    setCurrentPage(RETRO_LIST_PAGE);
    setFetchedRetros([]);
    setTotalPages(null);
  }, [isMyPage]);

  useEffect(() => {
    if (!isMyPage) return;
    if (!myRetrosQuery.data) return;

    setTotalPages(myRetrosQuery.data.totalPages);
    setFetchedRetros((prev) => {
      const base = currentPage === RETRO_LIST_PAGE ? [] : prev;
      const merged = new Map(base.map((item) => [item.id, item]));
      myRetrosQuery.data.content.forEach((item) => merged.set(item.id, item));
      return Array.from(merged.values());
    });
  }, [currentPage, isMyPage, myRetrosQuery.data]);

  const hasMore =
    totalPages === null
      ? (myRetrosQuery.data?.content.length ?? 0) === RETRO_LIST_SIZE
      : currentPage < totalPages;

  const loadMore = useCallback(() => {
    if (!isMyPage) return;
    if (!hasMore) return;
    if (myRetrosQuery.isFetching) return;
    setCurrentPage((prev) => prev + 1);
  }, [hasMore, isMyPage, myRetrosQuery.isFetching]);

  const retros = useMemo(
    () => (isMyPage ? fetchedRetros : EXPLORE_RETRO_MOCKS),
    [fetchedRetros, isMyPage],
  );

  return {
    activeSection,
    setActiveSection,
    retros,
    isMyPage,
    isLoading: isMyPage && myRetrosQuery.isLoading,
    isError: isMyPage && myRetrosQuery.isError,
    isFetching: isMyPage && myRetrosQuery.isFetching,
    hasMore: isMyPage && hasMore,
    loadMore,
  };
}
