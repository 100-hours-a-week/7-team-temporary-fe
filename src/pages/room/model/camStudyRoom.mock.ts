import type { CamStudyParticipantVM, CamStudyRoomSummary } from "./camStudyRoom.types";

const CAM_STUDY_MOCK_PARTICIPANTS_COUNT = 9;
const CAM_STUDY_MOCK_MAX_PARTICIPANTS = 20;

export function resolveMockSummary(initialSummary?: CamStudyRoomSummary): CamStudyRoomSummary {
  if (initialSummary) {
    const participantsCount = CAM_STUDY_MOCK_PARTICIPANTS_COUNT;
    return {
      activeCamParticipantsCount: clamp(
        initialSummary.activeCamParticipantsCount,
        0,
        participantsCount,
      ),
      participantsCount,
      maxParticipants: clamp(
        initialSummary.maxParticipants,
        participantsCount,
        CAM_STUDY_MOCK_MAX_PARTICIPANTS,
      ),
    };
  }

  const participantsCount = CAM_STUDY_MOCK_PARTICIPANTS_COUNT;
  return {
    activeCamParticipantsCount: Math.max(1, Math.floor(participantsCount / 2)),
    participantsCount,
    maxParticipants: CAM_STUDY_MOCK_MAX_PARTICIPANTS,
  };
}

export function createMockParticipants(
  roomId: number,
  summary: CamStudyRoomSummary,
): CamStudyParticipantVM[] {
  const participantsCount = clamp(summary.participantsCount, 0, summary.maxParticipants);
  const activeCamCount = clamp(summary.activeCamParticipantsCount, 0, participantsCount);
  const now = Date.now();

  return Array.from({ length: participantsCount }, (_, index) => {
    const userId = roomId * 100 + index + 1;
    const cameraEnabled = index < activeCamCount;
    const screenVisible = cameraEnabled && (index + roomId) % 4 !== 0;
    const isMe = index === participantsCount - 1;
    return {
      userId,
      nickname: index === 0 ? "방장" : `참여자 ${index}`,
      cameraEnabled,
      screenVisible,
      isMe,
      profileImageUrl: null,
      joinedAt: new Date(now - (participantsCount - index) * 60_000).toISOString(),
      role: index === 0 ? "OWNER" : "PARTICIPANT",
    } satisfies CamStudyParticipantVM;
  });
}

export function toOrderedParticipants(
  participants: CamStudyParticipantVM[],
): CamStudyParticipantVM[] {
  return [...participants].sort((a, b) => {
    const joinedAtDiff = parseJoinedAt(a.joinedAt) - parseJoinedAt(b.joinedAt);
    if (joinedAtDiff !== 0) return joinedAtDiff;
    return a.userId - b.userId;
  });
}

function parseJoinedAt(joinedAt: string): number {
  const parsed = Date.parse(joinedAt);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
