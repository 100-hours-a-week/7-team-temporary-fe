import { apiFetch, Endpoint } from "@/shared/api";
import { AuthService } from "@/shared/auth";

import { getMockChatRoomListResponse } from "./mock";
import type { ChatRoomListResponseDto, ChatRoomType } from "./types";

interface FetchChatRoomListParams {
  type: ChatRoomType;
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

const CHAT_ROOM_LIST_ENABLE_MOCK_FALLBACK = true;

function toChatRoomListSearchParams({
  type,
  page = 1,
  size = 10,
}: {
  type: ChatRoomType;
  page?: number;
  size?: number;
}) {
  return new URLSearchParams({ type, page: String(page), size: String(size) });
}

export async function fetchChatRoomList({
  type,
  page = 1,
  size = 10,
  signal,
}: FetchChatRoomListParams): Promise<ChatRoomListResponseDto> {
  const searchParams = toChatRoomListSearchParams({ type, page, size });

  try {
    return await AuthService.refreshAndRetry(() =>
      apiFetch<ChatRoomListResponseDto>(
        `${Endpoint.CHAT_ROOMS.PARTICIPANTS}?${searchParams.toString()}`,
        { signal, authRequired: true },
      ),
    );
  } catch {
    if (!CHAT_ROOM_LIST_ENABLE_MOCK_FALLBACK) throw new Error("채팅방 목록 조회 실패");
    return getMockChatRoomListResponse({ type, page, size });
  }
}
