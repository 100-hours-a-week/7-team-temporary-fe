import { apiFetch, Endpoint } from "@/shared/api";
import { AuthService } from "@/shared/auth";

import type {
  CreateFriendRequestResponseDto,
  FriendListResponseDto,
  FriendRequestListResponseDto,
  FriendSearchResponseDto,
} from "./types";

interface FetchFriendsParams {
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

interface FetchFriendSearchByNicknameParams {
  nickname: string;
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

interface FetchFriendRequestsParams {
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

interface DeleteFriendRequestParams {
  requestId: number;
}

interface DeleteFriendParams {
  friendUserId: number;
}

interface CreateFriendRequestParams {
  targetUserId: number;
}

function toFriendListSearchParams({ page = 1, size = 10 }: { page?: number; size?: number }) {
  return new URLSearchParams({
    page: String(page),
    size: String(size),
  });
}

function toFriendSearchByNicknameSearchParams({
  nickname,
  page = 1,
  size = 10,
}: {
  nickname: string;
  page?: number;
  size?: number;
}) {
  return new URLSearchParams({
    nickname,
    page: String(page),
    size: String(size),
  });
}

export async function fetchFriends({
  page = 1,
  size = 10,
  signal,
}: FetchFriendsParams): Promise<FriendListResponseDto> {
  const searchParams = toFriendListSearchParams({ page, size });

  return AuthService.refreshAndRetry(() =>
    apiFetch<FriendListResponseDto>(`${Endpoint.FRIENDS.LIST}?${searchParams.toString()}`, {
      signal,
      authRequired: true,
    }),
  );
}

export async function fetchFriendSearchByNickname({
  nickname,
  page = 1,
  size = 10,
  signal,
}: FetchFriendSearchByNicknameParams): Promise<FriendSearchResponseDto> {
  const searchParams = toFriendSearchByNicknameSearchParams({ nickname, page, size });

  return AuthService.refreshAndRetry(() =>
    apiFetch<FriendSearchResponseDto>(`${Endpoint.USER.NICKNAME}?${searchParams.toString()}`, {
      signal,
      authRequired: true,
    }),
  );
}

export async function fetchFriendRequests({
  page = 1,
  size = 10,
  signal,
}: FetchFriendRequestsParams): Promise<FriendRequestListResponseDto> {
  const searchParams = toFriendListSearchParams({ page, size });

  return AuthService.refreshAndRetry(() =>
    apiFetch<FriendRequestListResponseDto>(
      `${Endpoint.FRIEND_REQUESTS.LIST}?${searchParams.toString()}`,
      {
        signal,
        authRequired: true,
      },
    ),
  );
}

export async function deleteFriendRequest({ requestId }: DeleteFriendRequestParams): Promise<void> {
  return AuthService.refreshAndRetry(() =>
    apiFetch<void>(Endpoint.FRIEND_REQUESTS.DELETE(requestId), {
      method: "DELETE",
      authRequired: true,
    }),
  );
}

export async function deleteFriend({ friendUserId }: DeleteFriendParams): Promise<void> {
  return AuthService.refreshAndRetry(() =>
    apiFetch<void>(Endpoint.FRIENDS.DELETE(friendUserId), {
      method: "DELETE",
      authRequired: true,
    }),
  );
}

export async function createFriendRequest({
  targetUserId,
}: CreateFriendRequestParams): Promise<CreateFriendRequestResponseDto> {
  return AuthService.refreshAndRetry(() =>
    apiFetch<CreateFriendRequestResponseDto>(Endpoint.FRIEND_REQUESTS.CREATE(targetUserId), {
      method: "POST",
      authRequired: true,
    }),
  );
}
