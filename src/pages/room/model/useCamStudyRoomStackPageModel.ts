import { useCallback, useMemo, useState } from "react";

import {
  createMockParticipants,
  resolveMockSummary,
  toOrderedParticipants,
} from "./camStudyRoom.mock";
import type { CamStudyParticipantVM, CamStudyRoomSummary } from "./camStudyRoom.types";

interface UseCamStudyRoomStackPageModelParams {
  roomId: number;
  initialTitle?: string;
  initialSummary?: CamStudyRoomSummary;
}

export function useCamStudyRoomStackPageModel({
  roomId,
  initialTitle,
  initialSummary,
}: UseCamStudyRoomStackPageModelParams) {
  const summary = useMemo(() => resolveMockSummary(initialSummary), [initialSummary]);

  const roomTitle = useMemo(() => initialTitle?.trim() || "캠 스터디방", [initialTitle]);

  const [participants, setParticipants] = useState<CamStudyParticipantVM[]>(() =>
    toOrderedParticipants(createMockParticipants(roomId, summary)),
  );

  const [isControlMenuOpen, setIsControlMenuOpen] = useState(false);

  const isMyCameraEnabled = useMemo(
    () => participants.find((p) => p.isMe)?.cameraEnabled ?? false,
    [participants],
  );

  const summaryCounts = useMemo(
    () => ({
      activeCamParticipantsCount: participants.reduce(
        (count, p) => count + (p.cameraEnabled ? 1 : 0),
        0,
      ),
      participantsCount: participants.length,
      maxParticipants: summary.maxParticipants,
    }),
    [participants, summary.maxParticipants],
  );

  const handleToggleControlMenu = useCallback(() => {
    setIsControlMenuOpen((prev) => !prev);
  }, []);

  const handleToggleMyCamera = useCallback(() => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (!p.isMe) return p;
        const nextCameraEnabled = !p.cameraEnabled;
        return { ...p, cameraEnabled: nextCameraEnabled, screenVisible: nextCameraEnabled };
      }),
    );
  }, []);

  return {
    roomTitle,
    summaryCounts,
    participants,
    isMyCameraEnabled,
    isControlMenuOpen,
    handleToggleControlMenu,
    handleToggleMyCamera,
  };
}
