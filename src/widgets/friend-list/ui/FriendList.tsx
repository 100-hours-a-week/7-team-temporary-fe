"use client";

import { FriendListItem } from "@/entities/friend";
import { useFriendListSection } from "@/features/friend";
import { useInfiniteScrollTrigger } from "@/shared/hooks";
import { EmptyStateCard } from "@/shared/ui/empty";

export function FriendList() {
  const { friends, isLoading, isError, isFetching, hasMore, loadMore } = useFriendListSection();

  const { loadMoreRef } = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled: true,
    hasMore,
    isFetching,
    onLoadMore: loadMore,
  });

  return (
    <section className="px-6 pt-[13px] pb-32">
      {isLoading ? (
        <div className="rounded-2xl px-4 py-6 text-center text-sm text-neutral-500">
          친구 목록을 불러오는 중...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-2xl px-4 py-6 text-center text-sm text-neutral-500">
          친구 목록을 불러오지 못했습니다.
        </div>
      ) : null}

      {!isLoading && !isError && friends.length === 0 ? (
        <EmptyStateCard message="아직 친구 목록이 비어 있어요. 새 친구를 만들어볼까요?" />
      ) : null}

      {!isLoading && !isError ? (
        <ul className="flex flex-col gap-3">
          {friends.map((friend) => (
            <li key={friend.id}>
              <FriendListItem vm={friend} />
            </li>
          ))}
        </ul>
      ) : null}

      {!isLoading && !isError ? (
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
