"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { loginFormSchema } from "./schema";
import type { LoginFormModel } from "./types";

export const useLoginForm = () => {
  const form = useForm<LoginFormModel>({
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: zodResolver(loginFormSchema),
  });

  return {
    form,
    register: form.register,
    handleSubmit: form.handleSubmit,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
  };
};
