"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchDayPlanReflectionStatus } from "../api";

import { dayPlanQueryKeys } from "./queryKeys";

interface UseDayPlanReflectionStatusQueryOptions {
  dayPlanId: number | null;
}

export function useDayPlanReflectionStatusQuery({
  dayPlanId,
}: UseDayPlanReflectionStatusQueryOptions) {
  return useQuery({
    queryKey: dayPlanId !== null ? dayPlanQueryKeys.reflectionStatus(dayPlanId) : [],
    queryFn: ({ signal }) => fetchDayPlanReflectionStatus({ dayPlanId: dayPlanId!, signal }),
    enabled: dayPlanId !== null,
    staleTime: 1000 * 60 * 5,
  });
}
