"use client";

import type { ChatRoomMemberVM } from "../model";

import { ChatRoomMemberListItem } from "./ChatRoomMemberListItem";

interface ChatRoomMembersListProps {
  items: ChatRoomMemberVM[];
}

export function ChatRoomMembersList({ items }: ChatRoomMembersListProps) {
  return (
    <ul className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
      {items.map((item, index) => (
        <ChatRoomMemberListItem
          key={`${item.role}-${item.participantId ?? item.userId}`}
          member={item}
          isFirst={index === 0}
          isLast={index === items.length - 1}
        />
      ))}
    </ul>
  );
}
