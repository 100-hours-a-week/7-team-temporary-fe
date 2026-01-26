import { ApiError } from "@/shared/api";
import { apiFetch } from "@/shared/api";
import { mapCommonError } from "@/shared/api/error/common";

interface UseApiMutationProps<TForm, TDto, TResult = void> {
  url: string | ((form: TForm) => string);
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  dtoFn?: (form: TForm) => TDto;
  onSuccess?: (data: TResult) => void;
  onError?: (error: unknown) => void;
  invalidateKeys?: Array<readonly unknown[]>;
  errorMapper?: (error: unknown) => Error;
  credentials?: RequestCredentials;
}
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

/**
 * API 뮤테이션 공통 훅 모듈
 * - dto 변환 후 apiFetch 호출
 * - 성공 시 캐시 무효화 및 onSuccess 실행
 * - 에러는 호출부에서 처리
 * - 항상 틀만 제공, 구체적인 API 정보 및 에러는 호출부에서 전달
 */
export function useApiMutation<TForm, TDto, TResult = void>({
  url,
  method,
  dtoFn,
  onSuccess,
  onError: handleError,
  invalidateKeys = [],
  errorMapper,
  credentials,
}: UseApiMutationProps<TForm, TDto, TResult>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form: TForm) => {
      const apiUrl = typeof url === "function" ? url(form) : url;
      const dto = dtoFn ? dtoFn(form) : undefined;
      try {
        return await apiFetch<TResult, TDto>(apiUrl, {
          method,
          body: dto,
          credentials,
        });
      } catch (error) {
        const commonError = mapCommonError(error as ApiError);
        if (commonError) {
          throw commonError;
        }
        if (errorMapper) {
          throw errorMapper(error);
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log(data);
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      onSuccess?.(data);
    },
  });
}
