"use client";

import { useEffect, useRef } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import { AUTH_ERROR_CODE, AuthError } from "@/features/auth/api";

import type { LoginFormModel, LoginResponse } from "./types";

export function useLoginErrorEffect(
  mutation: UseMutationResult<LoginResponse, unknown, LoginFormModel>,
  form: UseFormReturn<LoginFormModel>,
) {
  const lastErrorRef = useRef<unknown>(null);

  useEffect(() => {
    const error = mutation.error;
    if (!error) return;
    if (lastErrorRef.current === error) return;
    lastErrorRef.current = error;

    if (!(error instanceof AuthError)) return;

    switch (error.code) {
      case AUTH_ERROR_CODE.INVALID_PASSWORD:
        form.setError("password", { message: error.userMessage });
        break;
      case AUTH_ERROR_CODE.EMAIL_CONFLICT:
        form.setError("email", { message: error.userMessage });
        break;
    }
  }, [form, mutation.error]);
}
