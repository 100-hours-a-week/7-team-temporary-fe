import { Icon } from "@/shared/ui/icon";

import type { FriendListItemVM } from "../model";

interface FriendListItemProps {
  vm: FriendListItemVM;
}

export function FriendListItem({ vm }: FriendListItemProps) {
  const avatarLetter = vm.nickname.charAt(0).toUpperCase() || "?";

  return (
    <article className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-4 py-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-sm font-semibold text-neutral-600">
        {vm.profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vm.profileImageUrl}
            alt={`${vm.nickname} 프로필 이미지`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden>{avatarLetter}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold text-black">{vm.nickname}</h3>
        <p className="truncate text-[13px] text-neutral-500">{vm.email}</p>
      </div>

      <div className="ml-2 flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label={`${vm.nickname} 채팅`}
          className="inline-flex h-8 w-8 items-center justify-center text-neutral-700"
        >
          <Icon
            name="chat_single"
            className="h-6 w-6"
          />
        </button>
        <button
          type="button"
          aria-label={`${vm.nickname} 삭제`}
          className="inline-flex h-8 w-8 items-center justify-center text-neutral-700"
        >
          <Icon
            name="user_delete"
            className="h-6 w-6"
          />
        </button>
      </div>
    </article>
  );
}
