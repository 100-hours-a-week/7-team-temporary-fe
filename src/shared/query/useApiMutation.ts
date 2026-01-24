import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/shared/api";

interface UseApiMutationProps<TForm, TDto, TResult = void> {
  url: string | ((form: TForm) => string);
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  dtoFn?: (form: TForm) => TDto;
  onSuccess?: (data: TResult) => void;
  invalidateKeys?: Array<readonly unknown[]>;
}

export function useApiMutation<TForm, TDto, TResult = void>({
  url,
  method,
  dtoFn,
  onSuccess,
  invalidateKeys = [],
}: UseApiMutationProps<TForm, TDto, TResult>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form: TForm) => {
      const apiUrl = typeof url === "function" ? url(form) : url;
      const dto = dtoFn ? dtoFn(form) : undefined;
      return apiFetch<TResult, TDto>(apiUrl, { method, body: dto });
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
