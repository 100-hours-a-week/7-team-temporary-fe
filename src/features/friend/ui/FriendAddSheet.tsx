"use client";

import { useEffect, useRef } from "react";

import { FriendBaseItem } from "@/entities/friend";
import { useInfiniteScrollTrigger } from "@/shared/hooks";
import { BottomSheet } from "@/shared/ui";
import { type FriendSearchResultVM, useFriendSearchSection } from "../model";

interface FriendAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FriendAddSheet({ open, onOpenChange }: FriendAddSheetProps) {
  const scrollRootRef = useRef<HTMLDivElement | null>(null);
  const {
    keyword,
    setKeyword,
    shouldSearch,
    friends,
    requestFriend,
    requestingFriendId,
    isLoading,
    isError,
    isFetching,
    hasMore,
    loadMore,
  } = useFriendSearchSection({ enabled: open });
  const { loadMoreRef } = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled: shouldSearch,
    hasMore,
    isFetching,
    onLoadMore: loadMore,
    rootRef: scrollRootRef,
  });

  useEffect(() => {
    if (open) return;
    setKeyword("");
  }, [open, setKeyword]);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      closeOnOverlayClick
      peekHeight={55}
      expandHeight={70}
      enableDragHandle
      sheetClassName="overflow-hidden pb-[env(safe-area-inset-bottom)]"
    >
      <section className="flex h-full min-h-0 flex-col px-6 pt-3 pb-4">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">친구 추가</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-sm font-medium text-neutral-500"
          >
            닫기
          </button>
        </header>

        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="닉네임 검색"
          className="text-md h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-300 focus:outline-none"
        />

        <div
          ref={scrollRootRef}
          className="mt-4 max-h-[45vh] min-h-0 overflow-y-auto overscroll-contain pr-1"
        >
          {!shouldSearch ? null : isLoading ? (
            <div className="rounded-2xl px-4 py-6 text-center text-sm text-neutral-500">
              검색 결과를 불러오는 중...
            </div>
          ) : isError ? (
            <div className="rounded-2xl px-4 py-6 text-center text-sm text-neutral-500">
              검색 결과를 불러오지 못했습니다.
            </div>
          ) : friends.length === 0 ? (
            <div className="rounded-2xl px-4 py-6 text-center text-sm text-neutral-500">
              검색결과가 없습니다.
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {friends.map((friend) => (
                <li key={`candidate-${friend.id}`}>
                  <FriendSearchResultItem
                    vm={friend}
                    onAdd={requestFriend}
                    isAdding={requestingFriendId === friend.id}
                  />
                </li>
              ))}
            </ul>
          )}

          {shouldSearch && hasMore ? (
            <div
              ref={loadMoreRef}
              className="h-4 w-full"
            />
          ) : null}
        </div>
      </section>
    </BottomSheet>
  );
}

interface FriendSearchResultItemProps {
  vm: FriendSearchResultVM;
  onAdd: (targetUserId: number) => void;
  isAdding: boolean;
}

function FriendSearchResultItem({ vm, onAdd, isAdding }: FriendSearchResultItemProps) {
  const isAddDisabled = vm.relationStatus !== "NONE" || isAdding;
  const buttonLabel = isAdding
    ? "요청 중"
    : vm.relationStatus === "FRIEND"
      ? "추가됨"
      : vm.relationStatus === "PENDING"
        ? "요청됨"
        : vm.relationStatus === "SELF"
          ? "본인"
          : "추가";

  return (
    <FriendBaseItem
      vm={vm}
      rightSlot={
        <button
          type="button"
          aria-label={`${vm.nickname} 친구 추가`}
          disabled={isAddDisabled}
          onClick={() => onAdd(vm.id)}
          className="rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {buttonLabel}
        </button>
      }
    />
  );
}
