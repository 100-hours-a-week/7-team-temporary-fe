import { apiFetch, Endpoint } from "@/shared/api";

import type { CamStudyRoomListResponseDto } from "./types";

export async function fetchCamStudyRoomList({
  page = 1,
  size = 10,
  signal,
}: {
  page?: number;
  size?: number;
  signal?: AbortSignal;
}): Promise<CamStudyRoomListResponseDto> {
  const searchParams = new URLSearchParams({
    type: "CAM_STUDY",
    page: String(page),
    size: String(size),
  });

  return apiFetch<CamStudyRoomListResponseDto>(
    `${Endpoint.CHAT_ROOMS.PARTICIPANTS}?${searchParams.toString()}`,
    {
      signal,
      authRequired: true,
    },
  );
}
