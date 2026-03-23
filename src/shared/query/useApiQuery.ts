import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/shared/api";
import { AuthService } from "@/shared/auth";

// Query Layer 공통 조회 훅: queryKey + endpoint 기준으로 서버 상태를 조회한다.
interface UseApiQueryProps {
  queryKey: readonly unknown[];
  url: string;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  authRequired?: boolean;
}

export function useApiQuery<TResult>({
  queryKey,
  url,
  enabled = true,
  staleTime,
  gcTime,
  authRequired = false,
}: UseApiQueryProps) {
  return useQuery({
    queryKey,
    queryFn: ({ signal }) => {
      const execute = () => apiFetch<TResult>(url, { signal, authRequired });
      return authRequired ? AuthService.refreshAndRetry(execute) : execute();
    },
    enabled,
    staleTime,
    gcTime,
  });
}
