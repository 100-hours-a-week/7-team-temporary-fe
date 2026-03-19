"use client";

import { useLayoutEffect } from "react";

import { IconButton } from "@/shared/ui/button";
import { useStackPage } from "@/widgets/stack";

import { useCamStudyRoomStackPageModel } from "../model/useCamStudyRoomStackPageModel";
import type { CamStudyRoomSummary } from "../model/camStudyRoom.types";
import { CamStudyControlDock } from "./CamStudyControlDock";
import { CamStudyParticipantGrid } from "./CamStudyParticipantGrid";
import { CamStudyRoomInfoStackPage } from "./CamStudyRoomInfoStackPage";

interface CamStudyRoomStackPageProps {
  roomId: number;
  initialTitle?: string;
  initialSummary?: CamStudyRoomSummary;
  initialParticipantId?: number;
}

export function CamStudyRoomStackPage({
  roomId,
  initialTitle,
  initialSummary,
  initialParticipantId,
}: CamStudyRoomStackPageProps) {
  const { push, setHeaderContent, setHeaderRightContent } = useStackPage();
  const {
    roomTitle,
    summaryCounts,
    participants,
    isMyCameraEnabled,
    isLivekitConnected,
    isControlMenuOpen,
    localVideoTrack,
    remoteVideoTracks,
    handleToggleControlMenu,
    handleToggleMyCamera,
  } = useCamStudyRoomStackPageModel({
    roomId,
    initialTitle,
    initialSummary,
    initialParticipantId,
  });

  useLayoutEffect(() => {
    setHeaderContent(<span className="text-[18px] font-semibold text-black">{roomTitle}</span>);
    setHeaderRightContent(
      <IconButton
        icon="more"
        label="캠 스터디방 설정"
        onClick={() => push(<CamStudyRoomInfoStackPage roomId={roomId} />)}
        className="p-0"
        iconClassName="h-7 w-7 text-ink-900 [&>path]:h-[18px] [&>path]:w-[18px]"
      />,
    );
    return () => {
      setHeaderContent(null);
      setHeaderRightContent(null);
    };
  }, [push, roomId, roomTitle, setHeaderContent, setHeaderRightContent]);

  return (
    <section className="scrollbar-hide h-full overflow-y-auto px-6 pt-4 pb-[90px]">
      <p className="text-[15px] font-semibold text-neutral-800">
        <span className="text-primary-500">{summaryCounts.activeCamParticipantsCount}명</span>{" "}
        공부중 {summaryCounts.participantsCount}/{summaryCounts.maxParticipants}
      </p>

      <CamStudyParticipantGrid
        participants={participants}
        localVideoTrack={localVideoTrack}
        remoteVideoTracks={remoteVideoTracks}
      />

      <CamStudyControlDock
        isCameraEnabled={isMyCameraEnabled}
        isCameraDisabled={!isLivekitConnected}
        isMenuOpen={isControlMenuOpen}
        onToggleMenu={handleToggleControlMenu}
        onToggleCamera={handleToggleMyCamera}
      />
    </section>
  );
}
