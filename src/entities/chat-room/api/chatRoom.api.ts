import { apiFetch, Endpoint } from "@/shared/api";

import {
  getMockChatRoomListResponse,
  getMockChatRoomMessageListResponse,
  getMockChatRoomOwnerStatus,
} from "./mock";
import type {
  ChatMessageListResponseDto,
  ChatRoomListResponseDto,
  ChatRoomType,
  ChatRoomOwnerStatusDto,
} from "./types";

interface FetchChatRoomListParams {
  type: ChatRoomType;
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

const CHAT_ROOM_LIST_ENABLE_MOCK_FALLBACK = true;
const CHAT_ROOM_OWNER_STATUS_ENABLE_MOCK_FALLBACK = true;
const CHAT_ROOM_MESSAGES_ENABLE_MOCK_FALLBACK = true;

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
    return await apiFetch<ChatRoomListResponseDto>(
      `${Endpoint.CHAT_ROOMS.PARTICIPANTS}?${searchParams.toString()}`,
      { signal, authRequired: true },
    );
  } catch {
    if (!CHAT_ROOM_LIST_ENABLE_MOCK_FALLBACK) throw new Error("채팅방 목록 조회 실패");
    return getMockChatRoomListResponse({ type, page, size });
  }
}

export async function fetchChatRoomSearchList({
  title = "",
  page = 1,
  size = 10,
  signal,
}: FetchChatRoomSearchListParams): Promise<ChatRoomListResponseDto> {
  try {
    return await apiFetch<ChatRoomListResponseDto>(
      Endpoint.CHAT_ROOMS.SEARCH({ title, page, size }),
      { signal, authRequired: true },
    );
  } catch {
    if (!CHAT_ROOM_LIST_ENABLE_MOCK_FALLBACK) throw new Error("채팅방 검색 조회 실패");
    return getMockChatRoomListResponse({ type: "OPEN_CHAT", page, size });
  }
}

export async function fetchChatRoomOwnerStatus({
  ownerId,
  signal,
}: {
  ownerId: number;
  signal?: AbortSignal;
}): Promise<ChatRoomOwnerStatusDto> {
  try {
    return await apiFetch<ChatRoomOwnerStatusDto>(Endpoint.CHAT_ROOMS.OWNER_STATUS(ownerId), {
      signal,
      authRequired: true,
    });
  } catch {
    if (!CHAT_ROOM_OWNER_STATUS_ENABLE_MOCK_FALLBACK) {
      throw new Error("방장 여부 조회 실패");
    }
    return getMockChatRoomOwnerStatus(ownerId);
  }
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
  const searchParams = new URLSearchParams();
  if (typeof cursor === "number") searchParams.set("cursor", String(cursor));
  if (typeof size === "number") searchParams.set("size", String(size));
  const query = searchParams.toString();
  const url = query
    ? `${Endpoint.CHAT_ROOMS.MESSAGES(roomId)}?${query}`
    : Endpoint.CHAT_ROOMS.MESSAGES(roomId);

  try {
    return await apiFetch<ChatMessageListResponseDto>(url, {
      signal,
      authRequired: true,
    });
  } catch {
    if (!CHAT_ROOM_MESSAGES_ENABLE_MOCK_FALLBACK) {
      throw new Error("채팅 메시지 목록 조회 실패");
    }
    return getMockChatRoomMessageListResponse({ roomId, cursor, size });
  }
}
