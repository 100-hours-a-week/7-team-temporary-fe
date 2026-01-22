"use client";

import type { BaseSyntheticEvent } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { LoginFormModel } from "../model";
import { EmailInput, FormField, PasswordInput } from "@/shared/form/ui";
import { GoToSignUpButton } from "./GoToSignUpButton";
import { LoginButton } from "./LoginButton";

interface LoginFormProps {
  register: UseFormRegister<LoginFormModel>;
  errors: FieldErrors<LoginFormModel>;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (event?: BaseSyntheticEvent) => void;
  onGoToSignUp?: () => void;
}

export function LoginForm({
  register,
  errors,
  isSubmitting,
  errorMessage,
  onSubmit,
  onGoToSignUp,
}: LoginFormProps) {
  const emailError = errors.email?.message?.toString();
  const passwordError = errors.password?.message?.toString();

  return (
    <form
      className="flex w-full flex-col gap-4"
      onSubmit={onSubmit}
    >
      <FormField
        label="이메일"
        error={emailError}
      >
        <EmailInput
          isDisabled={isSubmitting}
          invalid={!!errors.email}
          register={register("email")}
        />
      </FormField>
      <FormField
        label="비밀번호"
        error={passwordError}
      >
        <PasswordInput
          isDisabled={isSubmitting}
          invalid={!!errors.password}
          register={register("password")}
        />
      </FormField>
      {errorMessage && (
        <p
          className="text-sm text-red-600"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
      <LoginButton isLoading={isSubmitting} />
      <GoToSignUpButton onClick={onGoToSignUp} />
    </form>
  );
}
