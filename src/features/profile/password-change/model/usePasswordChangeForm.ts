"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import type { PasswordChangeFormModel } from "./types";
import { passwordChangeSchema } from "./schema";

const DEFAULT_FORM: PasswordChangeFormModel = {
  password: "",
  passwordConfirm: "",
};

interface UsePasswordChangeFormOptions {
  onValid?: (form: PasswordChangeFormModel) => void;
}

export const usePasswordChangeForm = (
  options: UsePasswordChangeFormOptions = {},
): UseFormReturn<PasswordChangeFormModel> & {
  canSubmit: boolean;
  submitForm: ReturnType<UseFormReturn<PasswordChangeFormModel>["handleSubmit"]>;
} => {
  const form = useForm<PasswordChangeFormModel>({
    defaultValues: DEFAULT_FORM,
    mode: "onChange",
    resolver: zodResolver(passwordChangeSchema),
  });

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = form;

  const submitForm = handleSubmit((values) => {
    options.onValid?.(values);
  });

  return {
    ...form,
    canSubmit: isValid && !isSubmitting,
    submitForm,
  };
};
