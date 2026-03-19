"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchPublicRetros } from "../api";

import { toPublicRetroListModel } from "./mappers";
import { retroQueryKeys } from "./queryKeys";

interface UsePublicRetrosQueryOptions {
  isOpen?: boolean;
  page?: number;
  size?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function usePublicRetrosQuery({
  isOpen = true,
  page = 1,
  size = 10,
  enabled = true,
  staleTime,
  gcTime,
}: UsePublicRetrosQueryOptions = {}) {
  return useQuery({
    queryKey: retroQueryKeys.publicList(isOpen, page, size),
    queryFn: ({ signal }) => fetchPublicRetros({ isOpen, page, size, signal }),
    select: toPublicRetroListModel,
    enabled,
    staleTime,
    gcTime,
  });
}
