"use client";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/entities/auth/model";

import { useLoginForm } from "../model/useLoginForm";
import { LoginForm } from "./LoginForm";

interface LoginFormContainerProps {
  onGoToSignUp?: () => void;
}

export function LoginFormContainer({ onGoToSignUp }: LoginFormContainerProps) {
  const router = useRouter();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  const { register, errors, isSubmitting, errorMessage, onSubmit } = useLoginForm({
    onSuccess: (accessToken) => {
      setAuthenticated(accessToken);
      router.replace("/home");
    },
  });

  return (
    <LoginForm
      register={register}
      errors={errors}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      onSubmit={onSubmit}
      onGoToSignUp={onGoToSignUp}
    />
  );
}
