import { apiFetch, Endpoint } from "@/shared/api";

import { CHAT_ROOM_MESSAGE_LIST_MOCK_ENABLED } from "./mock";
import { AuthService } from "@/shared/auth";

import type {
  ChatRoomDetailDto,
  ChatMessageListResponseDto,
  ChatRoomListResponseDto,
  ChatRoomOwnerStatusDto,
  IssueWebRtcTokenRequestDto,
  IssueWebRtcTokenResponseDto,
  JoinChatRoomResponseDto,
  SyncVideoSessionRequestDto,
  UpdateParticipantCameraStatusRequestDto,
  VideoParticipantsOnlineResponseDto,
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

  return AuthService.refreshAndRetry(() =>
    apiFetch<ChatRoomListResponseDto>(
      `${Endpoint.CHAT_ROOMS.PARTICIPANTS}?${searchParams.toString()}`,
      { signal, authRequired: true },
    ),
  );
}

export async function fetchChatRoomSearchList({
  title = "",
  page = 1,
  size = 10,
  signal,
}: FetchChatRoomSearchListParams): Promise<ChatRoomListResponseDto> {
  return AuthService.refreshAndRetry(() =>
    apiFetch<ChatRoomListResponseDto>(Endpoint.CHAT_ROOMS.SEARCH({ title, page, size }), {
      signal,
      authRequired: true,
    }),
  );
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
  return AuthService.refreshAndRetry(() =>
    apiFetch<ChatRoomOwnerStatusDto>(Endpoint.CHAT_ROOMS.OWNER_STATUS(roomId, ownerId), {
      signal,
      authRequired: true,
    }),
  );
}

export async function fetchChatRoomDetail({
  roomId,
  signal,
}: {
  roomId: number;
  signal?: AbortSignal;
}): Promise<ChatRoomDetailDto> {
  return AuthService.refreshAndRetry(() =>
    apiFetch<ChatRoomDetailDto>(Endpoint.CHAT_ROOMS.DETAIL(roomId), {
      signal,
      authRequired: true,
    }),
  );
}

export async function joinChatRoom({
  roomId,
  signal,
}: {
  roomId: number;
  signal?: AbortSignal;
}): Promise<JoinChatRoomResponseDto> {
  return apiFetch<JoinChatRoomResponseDto>(Endpoint.CHAT_ROOMS.JOIN(roomId), {
    method: "POST",
    signal,
    authRequired: true,
  });
}

export async function issueChatRoomWebRtcToken({
  roomId,
  participantId,
  signal,
}: {
  roomId: number;
  participantId: number;
  signal?: AbortSignal;
}): Promise<IssueWebRtcTokenResponseDto> {
  return apiFetch<IssueWebRtcTokenResponseDto, IssueWebRtcTokenRequestDto>(
    Endpoint.CHAT_ROOMS.WEBRTC_TOKEN(roomId),
    {
      method: "POST",
      body: { participantId },
      signal,
      authRequired: true,
    },
  );
}

export async function syncChatRoomVideoSession({
  roomId,
  participantId,
  sessionId,
  published,
  signal,
}: {
  roomId: number;
  participantId: number;
  sessionId: string;
  published: boolean;
  signal?: AbortSignal;
}): Promise<void> {
  return apiFetch<void, SyncVideoSessionRequestDto>(Endpoint.CHAT_ROOMS.VIDEO_SESSIONS(roomId), {
    method: "POST",
    body: { participantId, sessionId, published },
    signal,
    authRequired: true,
  });
}

export async function updateChatRoomParticipantCameraStatus({
  participantId,
  cameraEnabled,
  signal,
}: {
  participantId: number;
  cameraEnabled: boolean;
  signal?: AbortSignal;
}): Promise<void> {
  return apiFetch<void, UpdateParticipantCameraStatusRequestDto>(
    Endpoint.CHAT_ROOMS.UPDATE_CAMERA_STATUS(participantId),
    {
      method: "PATCH",
      body: { cameraEnabled },
      signal,
      authRequired: true,
    },
  );
}

export async function fetchVideoParticipantsOnline({
  roomId,
  signal,
}: {
  roomId: number;
  signal?: AbortSignal;
}): Promise<VideoParticipantsOnlineResponseDto> {
  return apiFetch<VideoParticipantsOnlineResponseDto>(
    Endpoint.CHAT_ROOMS.VIDEO_PARTICIPANTS_ONLINE(roomId),
    { signal, authRequired: true },
  );
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
    const { getMockChatRoomMessageListResponse } = await import("./mock");
    return getMockChatRoomMessageListResponse({ roomId, cursor, size });
  }

  const searchParams = new URLSearchParams();
  if (typeof cursor === "number") searchParams.set("cursor", String(cursor));
  if (typeof size === "number") searchParams.set("size", String(size));
  const query = searchParams.toString();
  const url = query
    ? `${Endpoint.CHAT_ROOMS.MESSAGES(roomId)}?${query}`
    : Endpoint.CHAT_ROOMS.MESSAGES(roomId);

  return AuthService.refreshAndRetry(() =>
    apiFetch<ChatMessageListResponseDto>(url, {
      signal,
      authRequired: true,
    }),
  );
}
