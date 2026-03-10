import { apiFetch, Endpoint } from "@/shared/api";
import { CHAT_ROOM_MESSAGE_LIST_MOCK_ENABLED, getMockChatRoomMessageListResponse } from "./mock";

import type {
  ChatRoomDetailDto,
  ChatMessageListResponseDto,
  ChatRoomListResponseDto,
  ChatRoomOwnerStatusDto,
} from "./types";

interface FetchChatRoomListParams {
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

interface FetchChatRoomSearchListParams {
  title?: string;
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

export async function fetchChatRoomList({
  page = 1,
  size = 10,
  signal,
}: FetchChatRoomListParams): Promise<ChatRoomListResponseDto> {
  const searchParams = new URLSearchParams({
    type: "OPEN_CHAT",
    page: String(page),
    size: String(size),
  });

  return apiFetch<ChatRoomListResponseDto>(
    `${Endpoint.CHAT_ROOMS.PARTICIPANTS}?${searchParams.toString()}`,
    { signal, authRequired: true },
  );
}

export async function fetchChatRoomSearchList({
  title = "",
  page = 1,
  size = 10,
  signal,
}: FetchChatRoomSearchListParams): Promise<ChatRoomListResponseDto> {
  return apiFetch<ChatRoomListResponseDto>(Endpoint.CHAT_ROOMS.SEARCH({ title, page, size }), {
    signal,
    authRequired: true,
  });
}

export async function fetchChatRoomOwnerStatus({
  roomId,
  ownerId,
  signal,
}: {
  roomId: number;
  ownerId: number;
  signal?: AbortSignal;
}): Promise<ChatRoomOwnerStatusDto> {
  return apiFetch<ChatRoomOwnerStatusDto>(Endpoint.CHAT_ROOMS.OWNER_STATUS(roomId, ownerId), {
    signal,
    authRequired: true,
  });
}

export async function fetchChatRoomDetail({
  roomId,
  signal,
}: {
  roomId: number;
  signal?: AbortSignal;
}): Promise<ChatRoomDetailDto> {
  return apiFetch<ChatRoomDetailDto>(Endpoint.CHAT_ROOMS.DETAIL(roomId), {
    signal,
    authRequired: true,
  });
}

export async function fetchChatRoomMessages({
  roomId,
  cursor,
  size = 50,
  signal,
}: {
  roomId: number;
  cursor?: number;
  size?: number;
  signal?: AbortSignal;
}): Promise<ChatMessageListResponseDto> {
  if (CHAT_ROOM_MESSAGE_LIST_MOCK_ENABLED) {
    return getMockChatRoomMessageListResponse({ roomId, cursor, size });
  }

  const searchParams = new URLSearchParams();
  if (typeof cursor === "number") searchParams.set("cursor", String(cursor));
  if (typeof size === "number") searchParams.set("size", String(size));
  const query = searchParams.toString();
  const url = query
    ? `${Endpoint.CHAT_ROOMS.MESSAGES(roomId)}?${query}`
    : Endpoint.CHAT_ROOMS.MESSAGES(roomId);

  return apiFetch<ChatMessageListResponseDto>(url, {
    signal,
    authRequired: true,
  });
}
