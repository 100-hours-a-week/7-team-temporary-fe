"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchNotifications } from "../api";
import { notificationQueryKeys } from "./queryKeys";

interface UseNotificationsQueryOptions {
  page?: number;
  size?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useNotificationsQuery({
  page = 1,
  size = 10,
  enabled = true,
  staleTime,
  gcTime,
}: UseNotificationsQueryOptions) {
  return useQuery({
    queryKey: notificationQueryKeys.list(page, size),
    queryFn: ({ signal }) => fetchNotifications({ page, size, signal }),
    enabled,
    staleTime,
    gcTime,
  });
}
