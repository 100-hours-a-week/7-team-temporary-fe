"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ApiError } from "@/shared/api";

import { useLoginMutation } from "./useLoginMutation";
import { loginFormSchema } from "./schema";
import type { LoginFormModel } from "./types";

interface UseLoginFormOptions {
  onSuccess: (accessToken: string) => void;
}

export const useLoginForm = ({ onSuccess }: UseLoginFormOptions) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mutation = useLoginMutation({
    onSuccess: (data) => {
      setErrorMessage(null);
      onSuccess(data.accessToken);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormModel>({
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = handleSubmit((data) => {
    setErrorMessage(null);
    mutation.mutate(
      { email: data.email, password: data.password },
      {
        onError: (error) => {
          const message = error instanceof ApiError ? error.message : "로그인에 실패했습니다.";
          setErrorMessage(message);
        },
      },
    );
  });

  return {
    register,
    errors,
    isSubmitting: isSubmitting || mutation.isPending,
    errorMessage,
    onSubmit,
  };
};
