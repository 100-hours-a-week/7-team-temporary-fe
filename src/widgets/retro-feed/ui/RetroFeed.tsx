"use client";

import { RetroListItemCard, useRetroSection } from "@/features/retro";
import { useInfiniteScrollTrigger } from "@/shared/hooks";

import { RetroSectionTabs } from "./RetroSectionTabs";

export function RetroFeed() {
  const {
    activeSection,
    setActiveSection,
    retros,
    isMyPage,
    isLoading,
    isError,
    isFetching,
    hasMore,
    loadMore,
  } = useRetroSection();

  const { loadMoreRef } = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled: isMyPage,
    hasMore,
    isFetching,
    onLoadMore: loadMore,
  });

  return (
    <section className="scrollbar-hide h-full overflow-y-auto px-6 pb-[90px]">
      <RetroSectionTabs
        activeSection={activeSection}
        onChange={setActiveSection}
      />

      {isLoading ? (
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
          회고를 불러오는 중...
        </div>
      ) : null}

      {isError ? (
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
          회고를 불러오지 못했습니다.
        </div>
      ) : null}

      {!isLoading && !isError && isMyPage && retros.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
          아직 작성한 회고가 없습니다.
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <ul>
          {retros.map((retro) => (
            <li key={retro.id}>
              <RetroListItemCard vm={retro} />
            </li>
          ))}
        </ul>
      ) : null}

      {!isLoading && !isError && isMyPage ? (
        <>
          <div
            ref={loadMoreRef}
            className="h-px"
          />
          {isFetching && hasMore ? (
            <div className="pt-2 text-center text-xs text-neutral-400">불러오는 중...</div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
