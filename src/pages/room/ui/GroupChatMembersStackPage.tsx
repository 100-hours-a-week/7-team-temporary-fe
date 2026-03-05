"use client";

import { useGroupChatMembersStackPageModel } from "../model";
import { ChatRoomMembersList } from "@/entities/chat-room";

interface GroupChatMembersStackPageProps {
  roomId: number;
}

export function GroupChatMembersStackPage({ roomId }: GroupChatMembersStackPageProps) {
  const { isLoading, isError, items } = useGroupChatMembersStackPageModel({ roomId });

  return (
    <section className="scrollbar-hide h-full overflow-y-auto px-6 pt-4 pb-8">
      {isLoading ? (
        <div className="rounded-2xl bg-neutral-100 px-4 py-6 text-center text-sm text-neutral-600">
          그룹원 목록을 불러오는 중...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-2xl bg-[#FFF2F2] px-4 py-6 text-center text-sm text-[#DF454A]">
          그룹원 목록을 불러오지 못했습니다.
        </div>
      ) : null}

      {items.length > 0 ? <ChatRoomMembersList items={items} /> : null}
    </section>
  );
}
