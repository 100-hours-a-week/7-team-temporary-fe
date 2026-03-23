"use client";

import { useAuthStore } from "@/entities";
import { AuthService } from "@/shared/auth";
import { useMutationErrorEffect } from "@/shared/query";

import { useLoginForm, useLoginMutation } from "../model";
import { useLoginErrorEffect } from "../model/useLoginErrorEffect";
import { LoginForm } from "./LoginForm";

interface LoginFormContainerProps {
  onGoToSignUp?: () => void;
  onPrepareSignUp?: () => void;
}

export function LoginFormContainer({ onGoToSignUp, onPrepareSignUp }: LoginFormContainerProps) {
  const { form, register, errors, isSubmitting, handleSubmit } = useLoginForm();
  const mutation = useLoginMutation({
    onSuccess: async () => {
      // restoreFromCookie()로 deviceId를 캐싱한 뒤 setAuthenticated()를 호출한다.
      // 직접 setAuthenticated()만 하면 cachedDeviceId가 null이라 소켓 연결이 스킵된다.
      const ok = await AuthService.restoreFromCookie();
      if (!ok) {
        useAuthStore.getState().setAuthenticated();
      }
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
      onPrepareSignUp={onPrepareSignUp}
    />
  );
}
