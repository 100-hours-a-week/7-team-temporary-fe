import type { CamStudyRoomListItemVM } from "./types";

export type CamStudyStatusKey = "ACTIVE" | "BUSY" | "FULL" | "INACTIVE";

export interface CamStudyStatus {
  key: CamStudyStatusKey;
  label: string;
  dotClassName: string;
}

/** 혼잡 상태 진입 최소 인원 비율 (정원 대비) */
const CAM_STUDY_BUSY_RATIO = 0.85;

export function getCamStudyStatus(item: CamStudyRoomListItemVM): CamStudyStatus {
  const { participantsCount, maxParticipants, serverActive } = item;

  if (!serverActive || participantsCount === 0) {
    return { key: "INACTIVE", label: "비활성", dotClassName: "bg-neutral-400" };
  }

  if (participantsCount >= maxParticipants) {
    return { key: "FULL", label: "정원 초과", dotClassName: "bg-red-500" };
  }

  if (participantsCount >= Math.floor(maxParticipants * CAM_STUDY_BUSY_RATIO)) {
    return { key: "BUSY", label: "혼잡", dotClassName: "bg-yellow-400" };
  }

  return { key: "ACTIVE", label: "정상", dotClassName: "bg-green-500" };
}
