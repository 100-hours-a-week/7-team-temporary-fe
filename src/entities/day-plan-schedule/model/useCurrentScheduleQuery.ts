"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCurrentSchedule } from "../api";
import { dayPlanScheduleQueryKeys } from "./queryKeys";
import { toDayPlanScheduleModelOrNull } from "./scheduleMappers";

interface UseCurrentScheduleQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
}

export function useCurrentScheduleQuery(options: UseCurrentScheduleQueryOptions = {}) {
  const {
    enabled = true,
    staleTime = 60_000,
    gcTime,
    refetchOnMount = false,
    refetchOnWindowFocus = false,
  } = options;

  return useQuery({
    queryKey: dayPlanScheduleQueryKeys.currentSchedule(),
    queryFn: ({ signal }) => fetchCurrentSchedule({ signal }),
    select: toDayPlanScheduleModelOrNull,
    enabled,
    staleTime,
    gcTime,
    refetchOnMount,
    refetchOnWindowFocus,
  });
}
