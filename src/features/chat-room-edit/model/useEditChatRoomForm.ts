import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { EDIT_CHAT_ROOM_FORM_DEFAULTS } from "./types";
import type { EditChatRoomFormModel } from "./types";

interface UseEditChatRoomFormOptions {
  onValid?: (values: EditChatRoomFormModel) => void | Promise<void>;
}

export function useEditChatRoomForm(
  options: UseEditChatRoomFormOptions = {},
): UseFormReturn<EditChatRoomFormModel> & {
  canSubmit: boolean;
  submitForm: ReturnType<UseFormReturn<EditChatRoomFormModel>["handleSubmit"]>;
} {
  const form = useForm<EditChatRoomFormModel>({
    mode: "onChange",
    defaultValues: EDIT_CHAT_ROOM_FORM_DEFAULTS,
  });

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = form;

  const submitForm = handleSubmit((values) => options.onValid?.(values));

  return {
    ...form,
    canSubmit: isValid && !isSubmitting,
    submitForm,
  };
}
