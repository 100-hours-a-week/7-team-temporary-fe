"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import type { TaskBasketFormModel } from "./types";
import { TASK_BASKET_FORM_DEFAULTS } from "./types";
import { taskBasketFormSchema } from "./schema";

interface UseTaskBasketFormOptions {
  onValid?: (form: TaskBasketFormModel) => void;
}

export const useTaskBasketForm = (
  options: UseTaskBasketFormOptions = {},
): UseFormReturn<TaskBasketFormModel> & {
  canSubmit: boolean;
  submitForm: ReturnType<UseFormReturn<TaskBasketFormModel>["handleSubmit"]>;
} => {
  const form = useForm<TaskBasketFormModel>({
    defaultValues: TASK_BASKET_FORM_DEFAULTS,
    mode: "onChange",
    resolver: zodResolver(taskBasketFormSchema),
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
