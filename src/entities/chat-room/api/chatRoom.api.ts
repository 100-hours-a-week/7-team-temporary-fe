import { apiFetch, Endpoint } from "@/shared/api";

import type {
  ChatRoomDetailDto,
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
  ownerId,
  signal,
}: {
  ownerId: number;
  signal?: AbortSignal;
}): Promise<ChatRoomOwnerStatusDto> {
  return apiFetch<ChatRoomOwnerStatusDto>(Endpoint.CHAT_ROOMS.OWNER_STATUS(ownerId), {
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
