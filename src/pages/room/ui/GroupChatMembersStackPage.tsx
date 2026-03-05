"use client";

import { useCallback } from "react";

import { useGroupChatMembersStackPageModel } from "../model";
import { ChatRoomMembersList } from "@/entities/chat-room";
import { useLeaveChatRoomMutation } from "@/features/chat-room-leave";
import { useToast } from "@/shared/ui/toast";
import { useStackPage } from "@/widgets/stack";

interface GroupChatMembersStackPageProps {
  roomId: number;
}

export function GroupChatMembersStackPage({ roomId }: GroupChatMembersStackPageProps) {
  const { pop } = useStackPage();
  const { showToast } = useToast();
  const leaveChatRoomMutation = useLeaveChatRoomMutation();
  const { isLoading, isError, items, myParticipantId, isMyRoomOwner } =
    useGroupChatMembersStackPageModel({ roomId });

  const handleLeaveChatRoom = useCallback(async () => {
    if (typeof myParticipantId !== "number" || myParticipantId <= 0) {
      if (isMyRoomOwner) {
        showToast("방장은 채팅방을 나갈 수 없습니다.", "error");
        return;
      }
      showToast("참여자 정보를 확인하지 못했습니다.", "error");
      return;
    }

    try {
      await leaveChatRoomMutation.mutateAsync({
        roomId,
        participantId: myParticipantId,
      });
      showToast("채팅방에서 나갔습니다.", "success");
      pop();
      window.setTimeout(() => {
        pop();
      }, 360);
    } catch {
      showToast("채팅방 나가기에 실패했습니다.", "error");
    }
  }, [isMyRoomOwner, leaveChatRoomMutation, myParticipantId, pop, roomId, showToast]);

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

      {items.length > 0 ? (
        <>
          <ChatRoomMembersList items={items} />
          <button
            type="button"
            onClick={() => void handleLeaveChatRoom()}
            disabled={leaveChatRoomMutation.isPending}
            className="mt-4 h-12 w-full rounded-xl border border-neutral-200 bg-neutral-100 text-sm font-semibold text-neutral-700"
          >
            {leaveChatRoomMutation.isPending ? "나가는 중..." : "채팅방 나가기"}
          </button>
        </>
      ) : null}
    </section>
  );
}
