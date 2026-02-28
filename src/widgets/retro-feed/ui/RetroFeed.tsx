"use client";

import { useState } from "react";

import {
  RETRO_SECTION,
  type RetroSection,
  type MyRetroCardVM,
  retroQueryKeys,
  RetroCardSkeleton,
} from "@/entities/retro";
import { RetroListItemCard, RetroEditSheet, useRetroSection } from "@/features/retro";
import { useInfiniteScrollTrigger } from "@/shared/hooks";
import { EmptyStateCard } from "@/shared/ui/empty";
import { SectionTabs, type SectionTab } from "@/shared/ui/section-tabs";

const RETRO_TABS: ReadonlyArray<SectionTab<RetroSection>> = [
  { id: RETRO_SECTION.MY_PAGE, label: "내 페이지" },
  { id: RETRO_SECTION.EXPLORE, label: "둘러보기" },
];

interface RetroFeedProps {
  enabled?: boolean;
}

export function RetroFeed({ enabled = true }: RetroFeedProps) {
  const [editingRetro, setEditingRetro] = useState<MyRetroCardVM | null>(null);

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
  } = useRetroSection(RETRO_SECTION.MY_PAGE, { enabled });
  const showInitialSkeleton = !isError && retros.length === 0 && (isLoading || isFetching);

  const { loadMoreRef } = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled,
    hasMore,
    isFetching,
    onLoadMore: loadMore,
  });

  return (
    <section className="scrollbar-hide h-full overflow-y-auto px-6 pb-[90px]">
      <SectionTabs
        tabs={RETRO_TABS}
        activeTab={activeSection}
        onChange={setActiveSection}
      />

      {showInitialSkeleton ? (
        <ul
          aria-busy
          aria-label="회고를 불러오는 중"
        >
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i}>
              <RetroCardSkeleton tone="strong" />
            </li>
          ))}
        </ul>
      ) : null}

      {isError ? (
        <div className="mt-4 rounded-2xl px-4 py-6 text-center text-sm text-neutral-500">
          회고를 불러오지 못했습니다.
        </div>
      ) : null}

      {!showInitialSkeleton && !isError && retros.length === 0 ? (
        <EmptyStateCard
          message={isMyPage ? "아직 작성한 회고가 없습니다." : "공개된 회고가 없습니다."}
          className="mt-4"
        />
      ) : null}

      {!showInitialSkeleton && !isError && retros.length > 0 ? (
        <ul>
          {retros.map((retro) => (
            <li key={retro.id}>
              <RetroListItemCard
                vm={retro}
                onEditClick={
                  retro.isMine && "isOpen" in retro
                    ? () => setEditingRetro(retro as MyRetroCardVM)
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      ) : null}

      {!showInitialSkeleton && !isError ? (
        <>
          <div
            ref={loadMoreRef}
            className="h-px"
          />
          {isFetching && hasMore ? (
            <ul
              aria-busy
              aria-label="회고를 불러오는 중"
            >
              {Array.from({ length: 3 }, (_, i) => (
                <li key={i}>
                  <RetroCardSkeleton tone="strong" />
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}

      <RetroEditSheet
        open={editingRetro !== null}
        onOpenChange={(open) => {
          if (!open) setEditingRetro(null);
        }}
        retro={editingRetro}
        invalidateKeys={[retroQueryKeys.myListAll(), retroQueryKeys.publicListAll()]}
      />
    </section>
  );
}
