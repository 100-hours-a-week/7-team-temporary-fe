import { apiFetch, Endpoint } from "@/shared/api";
import { AuthService } from "@/shared/auth";

import type { NotificationListResponseDto } from "../model/types";

interface FetchNotificationsParams {
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

export async function fetchNotifications({
  page = 1,
  size = 10,
  signal,
}: FetchNotificationsParams): Promise<NotificationListResponseDto> {
  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  return AuthService.refreshAndRetry(() =>
    apiFetch<NotificationListResponseDto>(
      `${Endpoint.NOTIFICATIONS.LIST}?${searchParams.toString()}`,
      {
        signal,
        authRequired: true,
      },
    ),
  );
}
