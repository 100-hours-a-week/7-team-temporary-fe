"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { PublicRetroCardVM, PublicRetroListModel } from "@/entities/retro";
import { usePublicRetrosQuery, RetroCardSkeleton } from "@/entities/retro";
import { RetroListItemCard } from "@/features/retro";
import { useInfiniteScrollTrigger } from "@/shared/hooks";
import { EmptyStateCard } from "@/shared/ui";

interface RetroPublicFeedListProps {
  initialList: PublicRetroListModel;
}

function mergeRetros(prev: PublicRetroCardVM[], next: PublicRetroCardVM[]): PublicRetroCardVM[] {
  const merged = new Map(prev.map((item) => [item.id, item]));
  next.forEach((item) => merged.set(item.id, item));
  return Array.from(merged.values());
}

export function RetroPublicFeedList({ initialList }: RetroPublicFeedListProps) {
  const router = useRouter();
  const [extraRetros, setExtraRetros] = useState<PublicRetroCardVM[]>([]);
  const [currentPage, setCurrentPage] = useState(initialList.page);
  const [totalPages, setTotalPages] = useState(initialList.totalPages);

  // S3 presigned URL 재요청 방지: 5분간 stale 아님으로 유지
  // 좋아요는 setQueriesData로 캐시 직접 패치 → refetch 없이 처리
  // window focus 등 외부 refetch도 5분 이내엔 캐시 재사용
  const STALE_TIME = 5 * 60 * 1000;

  // 1페이지: 항상 활성화, staleTime으로 빈번한 window focus refetch 방지
  const page1Query = usePublicRetrosQuery({
    isOpen: true,
    page: initialList.page,
    size: initialList.size,
    staleTime: STALE_TIME,
  });

  // 2페이지 이상: 무한 스크롤 페이지네이션
  const paginationQuery = usePublicRetrosQuery({
    isOpen: true,
    page: currentPage,
    size: initialList.size,
    enabled: currentPage > initialList.page,
    staleTime: STALE_TIME,
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
              <RetroListItemCard
                vm={retro}
                onCardClick={() => router.push(`/retro/public/${retro.id}`)}
              />
            </li>
          ))}
        </ul>
      )}
      <div
        ref={loadMoreRef}
        className="h-px"
      />
      {paginationQuery.isFetching && hasMore ? (
        <ul
          aria-busy
          aria-label="회고를 불러오는 중"
        >
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i}>
              <RetroCardSkeleton />
            </li>
          ))}
        </ul>
      ) : null}
      {paginationQuery.isError ? (
        <div className="pt-2 pb-2 text-center text-xs text-neutral-400">
          추가 회고를 불러오지 못했습니다.
        </div>
      ) : null}
    </section>
  );
}
