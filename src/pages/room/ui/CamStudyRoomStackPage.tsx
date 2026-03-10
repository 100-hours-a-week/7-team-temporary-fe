"use client";

import { useLayoutEffect, useMemo } from "react";

import { useChatRoomDetailQuery } from "@/entities/chat-room";
import { useStackPage } from "@/widgets/stack";

interface CamStudyRoomStackPageProps {
  roomId: number;
  initialTitle?: string;
  initialSummary?: {
    activeCamParticipantsCount: number;
    participantsCount: number;
    maxParticipants: number;
  };
}

export function CamStudyRoomStackPage({
  roomId,
  initialTitle,
  initialSummary,
}: CamStudyRoomStackPageProps) {
  const { setHeaderContent, setHeaderRightContent } = useStackPage();
  const chatRoomDetailQuery = useChatRoomDetailQuery({ roomId });

  const roomTitle = useMemo(
    () => chatRoomDetailQuery.data?.title?.trim() || initialTitle || "캠 스터디방",
    [chatRoomDetailQuery.data?.title, initialTitle],
  );

  const summaryText = useMemo(() => {
    const detail = chatRoomDetailQuery.data;
    if (detail?.type === "CAM_STUDY") {
      const seenUserIds = new Set<number>();
      let activeCamParticipantsCount = 0;

      const includeMember = (member: { userId: number; cameraEnabled: boolean }) => {
        if (seenUserIds.has(member.userId)) return;
        seenUserIds.add(member.userId);
        if (member.cameraEnabled) {
          activeCamParticipantsCount += 1;
        }
      };

      includeMember(detail.owner);
      detail.participants.forEach(includeMember);

      return `${activeCamParticipantsCount}명 공부중 ${detail.participantsCount}/${detail.maxParticipants}`;
    }

    if (!initialSummary) return null;
    return `${initialSummary.activeCamParticipantsCount}명 공부중 ${initialSummary.participantsCount}/${initialSummary.maxParticipants}`;
  }, [chatRoomDetailQuery.data, initialSummary]);

  useLayoutEffect(() => {
    setHeaderContent(<span className="text-[18px] font-semibold text-black">{roomTitle}</span>);
    setHeaderRightContent(null);
    return () => {
      setHeaderContent(null);
      setHeaderRightContent(null);
    };
  }, [roomTitle, setHeaderContent, setHeaderRightContent]);

  return (
    <section className="scrollbar-hide h-full overflow-y-auto px-6 pt-4 pb-[90px]">
      {summaryText ? (
        <p className="text-[15px] font-semibold text-neutral-800">{summaryText}</p>
      ) : null}

      <div className="mt-3 rounded-2xl border border-neutral-200 bg-white px-4 py-5 text-sm text-neutral-500">
        캠 스터디방 전용 화면 구성 중입니다.
      </div>
    </section>
  );
}
