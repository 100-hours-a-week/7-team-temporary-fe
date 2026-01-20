import type { UseFormRegisterReturn } from "react-hook-form";

import { BaseInput } from "./BaseInput";

interface NicknameInputProps {
  register: UseFormRegisterReturn;
  placeholder?: string;
  isDisabled?: boolean;
}

export function NicknameInput({
  register,
  placeholder = "닉네임",
  isDisabled,
}: NicknameInputProps) {
  return (
    <BaseInput
      disabled={isDisabled}
      placeholder={placeholder}
      register={register}
      type="text"
    />
  );
}
