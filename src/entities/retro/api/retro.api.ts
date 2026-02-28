import { apiFetch, Endpoint } from "@/shared/api";
import { AuthService } from "@/shared/auth";

import type {
  MyRetroItemResponseDto,
  MyRetroListResponseDto,
  PublicRetroListResponseDto,
} from "./types";

interface FetchMyRetrosParams {
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

interface FetchPublicRetrosParams {
  isOpen?: boolean;
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

function toRetroListSearchParams({
  isOpen,
  page = 1,
  size = 10,
}: {
  isOpen?: boolean;
  page?: number;
  size?: number;
}) {
  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (typeof isOpen === "boolean") {
    searchParams.set("isOpen", String(isOpen));
  }

  return searchParams;
}

export async function fetchMyRetros({
  page = 1,
  size = 10,
  signal,
}: FetchMyRetrosParams): Promise<MyRetroListResponseDto> {
  const searchParams = toRetroListSearchParams({ page, size });

  return AuthService.refreshAndRetry(() =>
    apiFetch<MyRetroListResponseDto>(`${Endpoint.RETRO.BASE}/me?${searchParams.toString()}`, {
      signal,
      authRequired: true,
    }),
  );
}

export async function fetchPublicRetroById(
  reflectionId: number,
  signal?: AbortSignal,
): Promise<MyRetroItemResponseDto> {
  return apiFetch<MyRetroItemResponseDto>(Endpoint.RETRO.BY_ID(reflectionId), { signal });
}

export async function fetchPublicRetros({
  isOpen = true,
  page = 1,
  size = 10,
  signal,
}: FetchPublicRetrosParams = {}): Promise<PublicRetroListResponseDto> {
  const searchParams = toRetroListSearchParams({ isOpen, page, size });

  return apiFetch<PublicRetroListResponseDto>(
    `${Endpoint.RETRO.PUBLIC_LIST}?${searchParams.toString()}`,
    {
      signal,
    },
  );
}

interface UpdateRetroParams {
  reflectionId: number;
  content: string;
  isOpen: boolean;
}

export async function updateRetro({
  reflectionId,
  content,
  isOpen,
}: UpdateRetroParams): Promise<void> {
  return AuthService.refreshAndRetry(() =>
    apiFetch<void>(Endpoint.RETRO.UPDATE(reflectionId), {
      method: "PUT",
      body: { content, isOpen },
      authRequired: true,
    }),
  );
}

export async function patchRetroVisibility(reflectionId: number, isOpen: boolean): Promise<void> {
  return AuthService.refreshAndRetry(() =>
    apiFetch<void>(Endpoint.RETRO.UPDATE_VISIBILITY(reflectionId), {
      method: "PATCH",
      body: { isOpen },
      authRequired: true,
    }),
  );
}

export async function deleteRetro(reflectionId: number): Promise<void> {
  return AuthService.refreshAndRetry(() =>
    apiFetch<void>(Endpoint.RETRO.DELETE(reflectionId), {
      method: "DELETE",
      authRequired: true,
    }),
  );
}

export async function likeRetro(reflectionId: number): Promise<void> {
  return AuthService.refreshAndRetry(() =>
    apiFetch<void>(Endpoint.RETRO.LIKE(reflectionId), {
      method: "POST",
      authRequired: true,
    }),
  );
}

export async function unlikeRetro(reflectionId: number): Promise<void> {
  return AuthService.refreshAndRetry(() =>
    apiFetch<void>(Endpoint.RETRO.LIKE(reflectionId), {
      method: "DELETE",
      authRequired: true,
    }),
  );
}
