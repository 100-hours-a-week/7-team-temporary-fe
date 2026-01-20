import { Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";

import type { LoginFormModel, LoginRequestDto, LoginResponse } from "./types";

interface UseLoginMutationOptions {
  onSuccess?: (data: LoginResponse) => void;
}

export function useLoginMutation(options: UseLoginMutationOptions = {}) {
  return useApiMutation<LoginFormModel, LoginRequestDto, LoginResponse>({
    url: Endpoint.AUTH.LOGIN,
    method: "POST",
    dtoFn: (form) => ({
      email: form.email,
      password: form.password,
    }),
    invalidateKeys: [],
    onSuccess: options.onSuccess,
  });
}
