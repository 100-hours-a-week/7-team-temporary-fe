"use client";

import { useCallback, useEffect, useState } from "react";

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
  const [retros, setRetros] = useState<PublicRetroCardVM[]>(initialList.content);
  const [currentPage, setCurrentPage] = useState(initialList.page);
  const [totalPages, setTotalPages] = useState(initialList.totalPages);

  const publicRetrosQuery = usePublicRetrosQuery({
    isOpen: true,
    page: currentPage,
    size: initialList.size,
    enabled: currentPage > initialList.page,
  });

  useEffect(() => {
    if (!publicRetrosQuery.data) return;

    setTotalPages(publicRetrosQuery.data.totalPages);
    setRetros((prev) => mergeRetros(prev, publicRetrosQuery.data.content));
  }, [publicRetrosQuery.data]);

  const hasMore = totalPages > 0 && currentPage < totalPages;

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    if (publicRetrosQuery.isFetching) return;
    setCurrentPage((prev) => prev + 1);
  }, [hasMore, publicRetrosQuery.isFetching]);

  const { loadMoreRef } = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled: true,
    hasMore,
    isFetching: publicRetrosQuery.isFetching,
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
        {publicRetrosQuery.isFetching && hasMore ? (
          <div className="pt-2 pb-2 text-center text-xs text-neutral-400">
            회고를 불러오는 중...
          </div>
        ) : null}
        {publicRetrosQuery.isError ? (
          <div className="pt-2 pb-2 text-center text-xs text-neutral-400">
            추가 회고를 불러오지 못했습니다.
          </div>
        ) : null}
      </section>
    </div>
  );
}
