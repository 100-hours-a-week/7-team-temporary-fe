"use client";

import type { BaseSyntheticEvent } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { LoginFormModel } from "../model";
import { FormField } from "@/shared/form/ui";

import { EmailInput } from "./EmailInput";
import { GoToSignUpButton } from "./GoToSignUpButton";
import { LoginButton } from "./LoginButton";
import { PasswordInput } from "./PasswordInput";

interface LoginFormProps {
  register: UseFormRegister<LoginFormModel>;
  errors: FieldErrors<LoginFormModel>;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (event?: BaseSyntheticEvent) => void;
}

export function LoginForm({
  register,
  errors,
  isSubmitting,
  errorMessage,
  onSubmit,
}: LoginFormProps) {
  const emailError = errors.email?.message?.toString();
  const passwordError = errors.password?.message?.toString();

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={onSubmit}
    >
      <FormField
        label="이메일"
        error={emailError}
      >
        <EmailInput
          isDisabled={isSubmitting}
          register={register("email")}
        />
      </FormField>
      <FormField
        label="비밀번호"
        error={passwordError}
      >
        <PasswordInput
          isDisabled={isSubmitting}
          register={register("password")}
        />
      </FormField>
      {errorMessage && (
        <p
          className="text-sm text-red-500"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
      <LoginButton isLoading={isSubmitting} />
      <GoToSignUpButton />
    </form>
  );
}
