"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { PublicRetroCardVM, PublicRetroListModel } from "@/entities/retro";
import { usePublicRetrosQuery } from "@/entities/retro";
import { RetroListItemCard } from "@/features/retro";
import { useInfiniteScrollTrigger } from "@/shared/hooks";
import { EmptyStateCard } from "@/shared/ui";
import { PublicPageHeader } from "@/widgets/public-page-header";

interface RetroPublicFeedProps {
  initialList: PublicRetroListModel;
}

function mergeRetros(prev: PublicRetroCardVM[], next: PublicRetroCardVM[]): PublicRetroCardVM[] {
  const merged = new Map(prev.map((item) => [item.id, item]));
  next.forEach((item) => merged.set(item.id, item));
  return Array.from(merged.values());
}

export function RetroPublicFeed({ initialList }: RetroPublicFeedProps) {
  const [extraRetros, setExtraRetros] = useState<PublicRetroCardVM[]>([]);
  const [currentPage, setCurrentPage] = useState(initialList.page);
  const [totalPages, setTotalPages] = useState(initialList.totalPages);

  // 1페이지: 항상 활성화 → React Query 기본 refetchOnWindowFocus로 탭 복귀 시 자동 갱신
  const page1Query = usePublicRetrosQuery({
    isOpen: true,
    page: initialList.page,
    size: initialList.size,
  });

  // 2페이지 이상: 무한 스크롤 페이지네이션
  const paginationQuery = usePublicRetrosQuery({
    isOpen: true,
    page: currentPage,
    size: initialList.size,
    enabled: currentPage > initialList.page,
  });

  // 2페이지 이상 누적
  useEffect(() => {
    if (!paginationQuery.data) return;
    setTotalPages(paginationQuery.data.totalPages);
    setExtraRetros((prev) => mergeRetros(prev, paginationQuery.data.content));
  }, [paginationQuery.data]);

  // 1페이지 최신 데이터(ISR 폴백 포함) + 누적된 2페이지 이상
  const page1Content = page1Query.data?.content ?? initialList.content;
  const retros = useMemo(() => mergeRetros(page1Content, extraRetros), [page1Content, extraRetros]);

  const hasMore = totalPages > 0 && currentPage < totalPages;

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    if (paginationQuery.isFetching) return;
    setCurrentPage((prev) => prev + 1);
  }, [hasMore, paginationQuery.isFetching]);

  const { loadMoreRef } = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled: true,
    hasMore,
    isFetching: paginationQuery.isFetching,
    onLoadMore: loadMore,
  });

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <PublicPageHeader title="회고" />
      <section className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6">
        {retros.length === 0 ? (
          <EmptyStateCard
            message="공개된 회고가 없습니다."
            className="mt-4 bg-white"
          />
        ) : (
          <ul>
            {retros.map((retro) => (
              <li key={retro.id}>
                <RetroListItemCard vm={retro} />
              </li>
            ))}
          </ul>
        )}
        <div
          ref={loadMoreRef}
          className="h-px"
        />
        {paginationQuery.isFetching && hasMore ? (
          <div className="pt-2 pb-2 text-center text-xs text-neutral-400">
            회고를 불러오는 중...
          </div>
        ) : null}
        {paginationQuery.isError ? (
          <div className="pt-2 pb-2 text-center text-xs text-neutral-400">
            추가 회고를 불러오지 못했습니다.
          </div>
        ) : null}
      </section>
    </div>
  );
}
