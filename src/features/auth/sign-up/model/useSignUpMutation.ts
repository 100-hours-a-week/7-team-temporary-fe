import { Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";
import { normalizeProfileImageKey } from "@/shared/validation";

import type { SignUpFormModel, SignUpRequestDto } from "./types";

export function useSignUpMutation(options: { onSuccess?: () => void } = {}) {
  return useApiMutation<SignUpFormModel, SignUpRequestDto, void>({
    url: Endpoint.USER.BASE,
    method: "POST",
    dtoFn: (form) => ({
      email: form.email,
      password: form.password,
      nickname: form.nickname,
      gender: form.gender as "MALE" | "FEMALE",
      birth: form.birth,
      focusTimeZone: form.focusTimeZone as "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT",
      dayEndTime: form.dayEndTime,
      profileImageKey: normalizeProfileImageKey(form.profileImageKey),
    }),
    onSuccess: () => options.onSuccess?.(),
  });
}
