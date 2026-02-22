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
    </article>
  );
}
