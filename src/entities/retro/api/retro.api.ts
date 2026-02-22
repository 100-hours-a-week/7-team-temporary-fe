import { apiFetch, Endpoint } from "@/shared/api";
import { AuthService } from "@/shared/auth";

import type { MyRetroListResponseDto, PublicRetroListResponseDto } from "./types";

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

export async function fetchPublicRetros({
  isOpen = true,
  page = 1,
  size = 10,
  signal,
}: FetchPublicRetrosParams = {}): Promise<PublicRetroListResponseDto> {
  const searchParams = toRetroListSearchParams({ isOpen, page, size });

  return apiFetch<PublicRetroListResponseDto>(`${Endpoint.RETRO.BASE}?${searchParams.toString()}`, {
    signal,
  });
}
