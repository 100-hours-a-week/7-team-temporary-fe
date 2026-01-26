"use client";

import { useEffect, useRef } from "react";
import type { UseMutationResult } from "@tanstack/react-query";

import type { UiError } from "@/shared/api/error";
import { useToast } from "@/shared/ui/toast";

export function useMutationErrorEffect<TData, TError, TVariables, TContext>(
  mutation: UseMutationResult<TData, TError, TVariables, TContext>,
) {
  const { showToast } = useToast();
  const lastErrorRef = useRef<unknown>(null);

  useEffect(() => {
    const error = mutation.error;
    if (!error) return;
    if (lastErrorRef.current === error) return;
    lastErrorRef.current = error;

    const exposable = error as Partial<UiError>;
    const shouldExpose = exposable.expose !== false;

    const message =
      exposable.userMessage ??
      (error instanceof Error ? error.message : undefined) ??
      "알 수 없는 오류가 발생했습니다.";

    if (shouldExpose) {
      showToast(message, "error");
    }
  }, [mutation, showToast]);
}
