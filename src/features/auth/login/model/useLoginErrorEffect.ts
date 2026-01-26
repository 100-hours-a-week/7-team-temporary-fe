"use client";

import { useEffect, useRef } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import { AUTH_ERROR_CODE, AuthError } from "@/features/auth/api";
import { useToast } from "@/shared/ui/toast";

import type { LoginFormModel, LoginResponse } from "./types";

export function useLoginErrorEffect(
  mutation: UseMutationResult<LoginResponse, unknown, LoginFormModel>,
  form: UseFormReturn<LoginFormModel>,
) {
  const lastErrorRef = useRef<unknown>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const error = mutation.error;
    if (!error) return;
    if (lastErrorRef.current === error) return;
    lastErrorRef.current = error;

    if (error instanceof AuthError) {
      showToast(error.message, "error");
      switch (error.type) {
        case AUTH_ERROR_CODE.INVALID_PASSWORD:
          form.setError("password", { message: error.message });
          break;
        case AUTH_ERROR_CODE.EMAIL_CONFLICT:
          form.setError("email", { message: error.message });
          break;
        case AUTH_ERROR_CODE.NICKNAME_CONFLICT:
          form.setError("email", { message: error.message });
          break;
      }
      mutation.reset();
      return;
    }

    if (error instanceof Error) {
      showToast(error.message, "error");
      mutation.reset();
      return;
    }

    showToast("알 수 없는 오류가 발생했습니다.", "error");
    mutation.reset();
  }, [form, mutation, showToast]);
}
