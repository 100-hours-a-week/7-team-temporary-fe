import { normalizeProfileImageKey } from "@/shared/validation";

import type { SignUpFormModel, SignUpRequestDto } from "./types";

export const toSignUpRequestDto = (form: SignUpFormModel): SignUpRequestDto => ({
  email: form.email,
  password: form.password,
  nickname: form.nickname,
  gender: form.gender as "MALE" | "FEMALE",
  birth: form.birth,
  focusTimeZone: form.focusTimeZone as "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT",
  dayEndTime: form.dayEndTime,
  profileImageKey: normalizeProfileImageKey(form.profileImageKey),
  terms: form.terms.map((term) => ({
    termsId: term.termsId,
    isAgreed: term.isAgreed,
  })),
});
