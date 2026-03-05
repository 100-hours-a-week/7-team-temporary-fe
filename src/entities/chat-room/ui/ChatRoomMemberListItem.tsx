"use client";

import { cn } from "@/shared/lib";
import { Icon } from "@/shared/ui/icon";

import type { ChatRoomMemberVM } from "../model";

interface ChatRoomMemberListItemProps {
  member: ChatRoomMemberVM;
  isFirst: boolean;
  isLast: boolean;
}

export function ChatRoomMemberListItem({ member, isFirst, isLast }: ChatRoomMemberListItemProps) {
  const avatarLetter = member.nickname.charAt(0).toUpperCase() || "?";

  return (
    <li
      className={cn(
        "flex items-center gap-3 bg-white px-4 py-3",
        isFirst && "rounded-t-3xl",
        isLast ? "rounded-b-3xl" : "border-b border-neutral-100",
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-sm font-semibold text-neutral-600">
        {member.profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.profileImageUrl}
            alt={`${member.nickname} 프로필 이미지`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden>{avatarLetter}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <div className="truncate text-sm font-semibold text-neutral-900">{member.nickname}</div>
          {member.role === "OWNER" ? (
            <Icon
              name="crown"
              className="h-4 w-4 shrink-0 text-[#E0A100]"
              aria-label="방장"
            />
          ) : null}
        </div>
      </div>
    </li>
  );
}
