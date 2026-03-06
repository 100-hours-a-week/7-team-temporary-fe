"use client";

import { FriendListItem, FriendRequestItem } from "@/entities/friend";
import { useFriendListSection } from "@/features/friend";
import { useInfiniteScrollTrigger } from "@/shared/hooks";
import { EmptyStateCard } from "@/shared/ui/empty";
import {
  FRIEND_LIST_EMPTY_MESSAGE,
  FRIEND_LIST_ERROR_MESSAGE,
  FRIEND_LIST_FETCHING_MESSAGE,
  FRIEND_LIST_SECTION_TITLE,
  FRIEND_REQUEST_SECTION_TITLE,
} from "../model/constants";
import { FriendListSkeleton } from "./FriendListSkeleton";

interface FriendListProps {
  onFriendChatRoomEntered?: (roomId: number) => void;
}

export function FriendList({ onFriendChatRoomEntered }: FriendListProps) {
  const {
    friendRequests,
    acceptFriendRequest,
    acceptingRequestId,
    rejectFriendRequest,
    rejectingRequestId,
    friends,
    deleteFriend,
    deletingFriendId,
    enterFriendChatRoom,
    enteringFriendId,
    isLoading,
    isError,
    isFetching,
    hasMore,
    loadMore,
  } = useFriendListSection({ onFriendChatRoomEntered });

  const { loadMoreRef } = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled: true,
    hasMore,
    isFetching,
    onLoadMore: loadMore,
  });

  return (
    <section className="px-6 pt-[13px] pb-32">
      {isLoading ? <FriendListSkeleton /> : null}

      {isError ? (
        <div className="rounded-2xl px-4 py-6 text-center text-sm text-neutral-500">
          {FRIEND_LIST_ERROR_MESSAGE}
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <div className="flex flex-col gap-4">
          {friendRequests.length > 0 ? (
            <section>
              <h2 className="mb-2 text-[14px] font-semibold text-neutral-500">
                {FRIEND_REQUEST_SECTION_TITLE}
              </h2>
              <ul className="flex flex-col gap-3">
                {friendRequests.map((friendRequest) => (
                  <li key={`request-${friendRequest.requestId}`}>
                    <FriendRequestItem
                      vm={friendRequest}
                      onAccept={acceptFriendRequest}
                      onReject={rejectFriendRequest}
                      isAccepting={acceptingRequestId === friendRequest.requestId}
                      isRejecting={rejectingRequestId === friendRequest.requestId}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h2 className="mb-2 text-[14px] font-semibold text-neutral-500">
              {FRIEND_LIST_SECTION_TITLE}
            </h2>
            {friends.length === 0 ? (
              <EmptyStateCard message={FRIEND_LIST_EMPTY_MESSAGE} />
            ) : (
              <ul className="flex flex-col gap-3">
                {friends.map((friend) => (
                  <li key={friend.id}>
                    <FriendListItem
                      vm={friend}
                      onDelete={deleteFriend}
                      isDeleting={deletingFriendId === friend.id}
                      onChat={enterFriendChatRoom}
                      isChatting={enteringFriendId === friend.id}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <div
            ref={loadMoreRef}
            className="h-px"
          />
          {isFetching && hasMore ? (
            <div className="pt-2 text-center text-xs text-neutral-400">
              {FRIEND_LIST_FETCHING_MESSAGE}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
