// pages/auth/sign-up/ui/useSignUpErrorEffect.ts
import { useEffect, useRef } from "react";
import { AuthError, AUTH_ERROR_CODE } from "@/features/auth/api";
import type { UseMutationResult } from "@tanstack/react-query";
import type { SignUpFormModel } from "@/features/auth/sign-up";
import type { UseFormReturn } from "react-hook-form";
import type { SignUpResult } from "@/features/auth/sign-up/model";

export function useSignUpErrorEffect(
  mutation: UseMutationResult<SignUpResult, unknown, SignUpFormModel>,
  form: UseFormReturn<SignUpFormModel>,
) {
  const lastErrorRef = useRef<unknown>(null);

  useEffect(() => {
    const error = mutation.error;
    if (!error) return;

    if (lastErrorRef.current === error) return;
    lastErrorRef.current = error;

    if (!(error instanceof AuthError)) {
      return;
    }

    switch (error.code) {
      case AUTH_ERROR_CODE.EMAIL_CONFLICT:
        form.setError("email", { message: error.userMessage });
        break;

      case AUTH_ERROR_CODE.NICKNAME_CONFLICT:
        form.setError("nickname", { message: error.userMessage });
        break;

      case AUTH_ERROR_CODE.INVALID_PASSWORD:
        form.setError("password", { message: error.userMessage });
        break;
    }
  }, [mutation.error, form]);
}
