import { getMockCamStudyRoomListResponse } from "./mock";

import type { CamStudyRoomListResponseDto } from "./types";

// TODO: /chat-rooms/participants?type=CAM_STUDY 실제 API 연동 시 대체 예정
export async function fetchCamStudyRoomList({
  page = 1,
  size = 10,
  signal: _signal,
}: {
  page?: number;
  size?: number;
  signal?: AbortSignal;
}): Promise<CamStudyRoomListResponseDto> {
  return getMockCamStudyRoomListResponse({ page, size });
}
