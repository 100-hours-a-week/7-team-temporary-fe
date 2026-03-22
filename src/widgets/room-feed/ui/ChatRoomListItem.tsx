import { memo } from "react";

import { useQueryClient } from "@tanstack/react-query";

import type { ChatRoomListItemVM } from "@/entities/chat-room-list";
import { chatRoomQueryKeys } from "@/entities/chat-room-query-keys";
import { useAuthStore } from "@/entities/user";
import { Icon } from "@/shared/ui/icon";

const PREFETCH_SIZE = 50;

interface ChatRoomListItemProps {
  item: ChatRoomListItemVM;
  onClick: (roomId: number) => void;
}

export const ChatRoomListItem = memo(function ChatRoomListItem({
  item,
  onClick,
}: ChatRoomListItemProps) {
  const queryClient = useQueryClient();
  const myUserId = useAuthStore((state) => state.userId ?? null);

  const handlePointerDown = () => {
    // fetchChatRoomMessages, toChatMessageListModel은 chat room session 청크와 공유되므로
    // 정적 import 시 room 청크에 불필요하게 포함됨 → 동적 import로 분리
    void import("@/entities/chat-room/api/chatRoom.api").then(({ fetchChatRoomMessages }) =>
      import("@/entities/chat-room/model/chatMessage.mapper").then(({ toChatMessageListModel }) =>
        queryClient.prefetchInfiniteQuery({
          queryKey: chatRoomQueryKeys.messagesInfinite(item.roomId, PREFETCH_SIZE, myUserId),
          queryFn: ({ pageParam, signal }) => {
            const cursor = (pageParam ?? undefined) as number | undefined;
            return fetchChatRoomMessages({
              roomId: item.roomId,
              cursor,
              size: PREFETCH_SIZE,
              signal,
            }).then((dto) => toChatMessageListModel(dto, { myUserId }));
          },
          initialPageParam: null,
        }),
      ),
    );
  };

  return (
    <button
      type="button"
      className="w-full rounded-[20px] border border-neutral-200 bg-white px-6 py-5 text-left"
      onPointerDown={handlePointerDown}
      onClick={() => onClick(item.roomId)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-semibold text-neutral-900">
              {item.title}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 text-[14px] text-neutral-500">
              <Icon
                name="user_filled"
                className="h-5 w-5 text-neutral-500"
                aria-hidden
              />
              {item.participantsCount}
            </span>
          </div>
        </div>

        {item.unreadCount > 0 ? (
          <span className="bg-primary-500 inline-flex items-center justify-center rounded-[20px] px-2 text-[14px] font-semibold text-white">
            {item.unreadCount > 99 ? "99+" : item.unreadCount}
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] text-neutral-500">{item.lastMessage ?? "\u00A0"}</p>
        </div>

        {item.lastMessageAt !== undefined ? (
          <span className="shrink-0 text-[14px] text-neutral-500">
            {formatLastMessageTime(item.lastMessageAt)}
          </span>
        ) : null}
      </div>
    </button>
  );
});

function formatLastMessageTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}
