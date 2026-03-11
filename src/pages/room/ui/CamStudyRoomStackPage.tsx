"use client";

import { useLayoutEffect } from "react";

import { useStackPage } from "@/widgets/stack";

import { useCamStudyRoomStackPageModel } from "../model/useCamStudyRoomStackPageModel";
import type { CamStudyRoomSummary } from "../model/camStudyRoom.types";
import { CamStudyControlDock } from "./CamStudyControlDock";
import { CamStudyParticipantGrid } from "./CamStudyParticipantGrid";

interface CamStudyRoomStackPageProps {
  roomId: number;
  initialTitle?: string;
  initialSummary?: CamStudyRoomSummary;
}

export function CamStudyRoomStackPage({
  roomId,
  initialTitle,
  initialSummary,
}: CamStudyRoomStackPageProps) {
  const { setHeaderContent, setHeaderRightContent } = useStackPage();
  const {
    roomTitle,
    summaryCounts,
    participants,
    isMyCameraEnabled,
    isControlMenuOpen,
    handleToggleControlMenu,
    handleToggleMyCamera,
  } = useCamStudyRoomStackPageModel({ roomId, initialTitle, initialSummary });

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
      <p className="text-[15px] font-semibold text-neutral-800">
        <span className="text-primary-500">{summaryCounts.activeCamParticipantsCount}명</span>{" "}
        공부중 {summaryCounts.participantsCount}/{summaryCounts.maxParticipants}
      </p>

      <CamStudyParticipantGrid participants={participants} />

      <CamStudyControlDock
        isCameraEnabled={isMyCameraEnabled}
        isMenuOpen={isControlMenuOpen}
        onToggleMenu={handleToggleControlMenu}
        onToggleCamera={handleToggleMyCamera}
      />
    </section>
  );
}
