"use client";

import { useState } from "react";

import { ApiError } from "@/shared/api";

import { useLoginMutation } from "../model";

import { EmailInput } from "./EmailInput";
import { GoToSignUpButton } from "./GoToSignUpButton";
import { LoginButton } from "./LoginButton";
import { PasswordInput } from "./PasswordInput";

interface LoginFormProps {
  onSuccess: (accessToken: string) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useLoginMutation({
    onSuccess: (data) => {
      setErrorMessage(null);
      onSuccess(data.accessToken);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    mutation.mutate(
      { email, password },
      {
        onError: (error) => {
          const message = error instanceof ApiError ? error.message : "로그인에 실패했습니다.";
          setErrorMessage(message);
        },
      },
    );
  };

  const isDisabled = mutation.isPending;

  return (
    <form
      className="flex w-full flex-col items-center justify-center gap-4"
      onSubmit={handleSubmit}
    >
      <EmailInput
        isDisabled={isDisabled}
        onChange={setEmail}
        value={email}
      />
      <PasswordInput
        isDisabled={isDisabled}
        onChange={setPassword}
        value={password}
      />
      {errorMessage && (
        <p
          className="text-sm text-red-500"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
      <LoginButton isLoading={mutation.isPending} />
      <GoToSignUpButton />
    </form>
  );
}
