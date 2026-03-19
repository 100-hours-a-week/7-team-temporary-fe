"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchMyProfile } from "../api";
import { userQueryKeys } from "./queryKeys";
import { useUserPreferencesStore } from "./userPreferences.store";

interface UseMyProfileQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useMyProfileQuery(options: UseMyProfileQueryOptions = {}) {
  const { enabled = true, staleTime = Infinity, gcTime = Infinity } = options;
  const setSchedulePreferences = useUserPreferencesStore((state) => state.setSchedulePreferences);

  const query = useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: ({ signal }) => fetchMyProfile(signal),
    enabled,
    staleTime,
    gcTime,
  });

  useEffect(() => {
    if (!query.data) return;
    setSchedulePreferences({
      dayEndTime: query.data.dayEndTime ?? null,
      focusTimeZone: query.data.focusTimeZone ?? null,
    });
  }, [query.data, setSchedulePreferences]);

  return query;
}
