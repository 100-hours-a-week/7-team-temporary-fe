import { ApiError, Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";

import type { LoginFormModel, LoginRequestDto, LoginResponse } from "./types";
import { toLoginRequestDto } from "./dto";
import { mapAuthError } from "@/features/auth/api";

interface UseLoginMutationOptions {
  onSuccess?: (data: LoginResponse) => void;
}

export function useLoginMutation(options: UseLoginMutationOptions = {}) {
  return useApiMutation<LoginFormModel, LoginRequestDto, LoginResponse>({
    url: Endpoint.TOKEN.BASE,
    method: "POST",
    dtoFn: toLoginRequestDto,
    invalidateKeys: [],
    credentials: "include",
    onSuccess: options.onSuccess,
    errorMapper: (error) => {
      if (error instanceof ApiError) {
        return mapAuthError(error);
      }

      if (error instanceof Error) {
        return error;
      }

      return new Error("로그인에 실패했습니다.");
    },
  });
}
