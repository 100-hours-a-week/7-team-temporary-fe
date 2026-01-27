import type { UseFormRegisterReturn } from "react-hook-form";

import { BaseInput } from "./BaseInput";

interface NicknameInputProps {
  register: UseFormRegisterReturn;
  placeholder?: string;
  isDisabled?: boolean;
  invalid?: boolean;
}

export function NicknameInput({
  register,
  placeholder = "닉네임",
  isDisabled,
  invalid,
}: NicknameInputProps) {
  return (
    <BaseInput
      disabled={isDisabled}
      invalid={invalid}
      placeholder={placeholder}
      register={register}
      type="text"
    />
  );
}
