import { apiFetch, Endpoint } from "@/shared/api";
import { AuthService } from "@/shared/auth";

import type { MyRetroListResponseDto } from "./types";

interface FetchMyRetrosParams {
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

export async function fetchMyRetros({
  page = 1,
  size = 10,
  signal,
}: FetchMyRetrosParams): Promise<MyRetroListResponseDto> {
  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  return AuthService.refreshAndRetry(() =>
    apiFetch<MyRetroListResponseDto>(`${Endpoint.RETRO.BASE}/me?${searchParams.toString()}`, {
      signal,
      authRequired: true,
    }),
  );
}
