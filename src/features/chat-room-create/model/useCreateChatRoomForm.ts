import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { CREATE_CHAT_ROOM_FORM_DEFAULTS } from "./types";
import type { CreateChatRoomFormModel } from "./types";

interface UseCreateChatRoomFormOptions {
  onValid?: (values: CreateChatRoomFormModel) => void | Promise<void>;
}

export function useCreateChatRoomForm(
  options: UseCreateChatRoomFormOptions = {},
): UseFormReturn<CreateChatRoomFormModel> & {
  canSubmit: boolean;
  submitForm: ReturnType<UseFormReturn<CreateChatRoomFormModel>["handleSubmit"]>;
} {
  const form = useForm<CreateChatRoomFormModel>({
    mode: "onChange",
    defaultValues: CREATE_CHAT_ROOM_FORM_DEFAULTS,
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
}
