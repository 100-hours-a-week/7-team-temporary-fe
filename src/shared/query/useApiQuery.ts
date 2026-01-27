import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/shared/api";

// Query Layer 공통 조회 훅: queryKey + endpoint 기준으로 서버 상태를 조회한다.
interface UseApiQueryProps {
  queryKey: readonly unknown[];
  url: string;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useApiQuery<TResult>({
  queryKey,
  url,
  enabled = true,
  staleTime,
  gcTime,
}: UseApiQueryProps) {
  // apiFetch는 Transport Layer로서 HTTP I/O만 수행한다.
  return useQuery({
    queryKey,
    queryFn: ({ signal }) => apiFetch<TResult>(url, { signal }),
    enabled,
    staleTime,
    gcTime,
  });
}
