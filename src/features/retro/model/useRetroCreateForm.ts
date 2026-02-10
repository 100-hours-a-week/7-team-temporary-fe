"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { RETRO_VISIBILITY } from "@/entities/retro";

import { retroCreateFormSchema } from "./schema";
import type { RetroCreateFormModel } from "./types";

export const RETRO_CREATE_FORM_DEFAULTS: RetroCreateFormModel = {
  reflectionImageIds: [],
  content: "",
  visibility: RETRO_VISIBILITY.PUBLIC,
};

interface UseRetroCreateFormOptions {
  onValid?: (form: RetroCreateFormModel) => void;
}

export const useRetroCreateForm = (
  options: UseRetroCreateFormOptions = {},
): UseFormReturn<RetroCreateFormModel> & {
  canSubmit: boolean;
  submitForm: ReturnType<UseFormReturn<RetroCreateFormModel>["handleSubmit"]>;
} => {
  const form = useForm<RetroCreateFormModel>({
    defaultValues: RETRO_CREATE_FORM_DEFAULTS,
    mode: "onChange",
    resolver: zodResolver(retroCreateFormSchema),
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
