import { ApiError, Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";
import type { SignUpFormModel, SignUpRequestDto } from "./types";
import { toSignUpRequestDto } from "./dto";
import { mapAuthError } from "../../api/error.mapper";

export function useSignUpMutation(options: { onSuccess?: () => void } = {}) {
  return useApiMutation<SignUpFormModel, SignUpRequestDto, void>({
    url: Endpoint.USER.BASE,
    method: "POST",
    dtoFn: toSignUpRequestDto,
    onSuccess: () => options.onSuccess?.(),
    errorMapper: (error) => {
      if (error instanceof ApiError) {
        return mapAuthError(error);
      }

      if (error instanceof Error) {
        return error;
      }

      return new Error("알 수 없는 오류가 발생했습니다.");
    },
  });
}
