"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMyRetros } from "../api";

import { toMyRetroListModel } from "./mappers";
import { retroQueryKeys } from "./queryKeys";

interface UseMyRetrosQueryOptions {
  page?: number;
  size?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useMyRetrosQuery({
  page = 1,
  size = 10,
  enabled = true,
  staleTime,
  gcTime,
}: UseMyRetrosQueryOptions = {}) {
  return useQuery({
    queryKey: retroQueryKeys.myList(page, size),
    queryFn: ({ signal }) => fetchMyRetros({ page, size, signal }),
    select: toMyRetroListModel,
    enabled,
    staleTime,
    gcTime,
  });
}
