import { apiFetch, Endpoint } from "@/shared/api";
import { AuthService } from "@/shared/auth";

import { getMockFriendsResponse } from "./mock";
import type { FriendListResponseDto } from "./types";

interface FetchFriendsParams {
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

const FRIEND_LIST_ENABLE_MOCK_FALLBACK = true;

function toFriendListSearchParams({ page = 1, size = 10 }: { page?: number; size?: number }) {
  return new URLSearchParams({
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

  try {
    return await AuthService.refreshAndRetry(() =>
      apiFetch<FriendListResponseDto>(`${Endpoint.FRIENDS.LIST}?${searchParams.toString()}`, {
        signal,
        authRequired: true,
      }),
    );
  } catch (error) {
    if (!FRIEND_LIST_ENABLE_MOCK_FALLBACK) {
      throw error;
    }

    return getMockFriendsResponse({ page, size });
  }
}
