"use client";

import { useRouter } from "next/navigation";

import type { AuthState } from "@/shared/auth";
import { useAuthStore } from "@/entities";
import { useMutationErrorEffect } from "@/shared/query";

import { useLoginForm, useLoginMutation } from "../model";
import { useLoginErrorEffect } from "../model/useLoginErrorEffect";
import { LoginForm } from "./LoginForm";

interface LoginFormContainerProps {
  onGoToSignUp?: () => void;
}

export function LoginFormContainer({ onGoToSignUp }: LoginFormContainerProps) {
  const router = useRouter();
  const setAuthenticated = useAuthStore((state: AuthState) => state.setAuthenticated);
  const { form, register, errors, isSubmitting, handleSubmit } = useLoginForm();
  const mutation = useLoginMutation({
    onSuccess: (data) => {
      setAuthenticated(data.accessToken);
    },
  });

  const onSubmit = handleSubmit((data) => mutation.mutate(data));

  useMutationErrorEffect(mutation);
  useLoginErrorEffect(mutation, form);

  return (
    <LoginForm
      register={register}
      errors={errors}
      isSubmitting={isSubmitting || mutation.isPending}
      errorMessage={null}
      onSubmit={onSubmit}
      onGoToSignUp={onGoToSignUp}
    />
  );
}
