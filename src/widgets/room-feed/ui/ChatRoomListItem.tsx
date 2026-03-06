import type { ChatRoomListItemVM } from "@/entities/chat-room";
import { Icon } from "@/shared/ui/icon";

interface ChatRoomListItemProps {
  item: ChatRoomListItemVM;
  onClick: (roomId: number) => void;
}

export function ChatRoomListItem({ item, onClick }: ChatRoomListItemProps) {
  return (
    <button
      type="button"
      className="w-full rounded-[20px] border border-neutral-200 bg-white px-6 py-5 text-left"
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
}

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
