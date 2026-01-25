// pages/auth/sign-up/ui/useSignUpErrorEffect.ts
import { useEffect, useRef } from "react";
import { AuthError, AUTH_ERROR_CODE } from "@/features/auth/api";
import type { UseMutationResult } from "@tanstack/react-query";
import type { SignUpFormModel } from "@/features/auth/sign-up";
import type { UseFormReturn } from "react-hook-form";
import type { SignUpResult } from "@/features/auth/sign-up/model";
import { useToast } from "@/shared/ui/toast";

export function useSignUpErrorEffect(
  mutation: UseMutationResult<SignUpResult, unknown, SignUpFormModel>,
  form: UseFormReturn<SignUpFormModel>,
) {
  const { showToast } = useToast();
  const lastErrorRef = useRef<unknown>(null);

  useEffect(() => {
    const error = mutation.error;
    if (!error) return;

    if (lastErrorRef.current === error) return;
    lastErrorRef.current = error;

    if (!(error instanceof AuthError)) {
      showToast("알 수 없는 오류가 발생했습니다.", "error");
      return;
    }

    showToast(error.message, "error");

    switch (error.type) {
      case AUTH_ERROR_CODE.EMAIL_CONFLICT:
        form.setError("email", { message: error.message });
        break;

      case AUTH_ERROR_CODE.NICKNAME_CONFLICT:
        form.setError("nickname", { message: error.message });
        break;

      case AUTH_ERROR_CODE.INVALID_PASSWORD:
        form.setError("password", { message: error.message });
        break;
    }

    mutation.reset();
  }, [mutation.error, mutation.reset, form, showToast]);
}
