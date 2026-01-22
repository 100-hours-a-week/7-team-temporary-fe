import type { UseFormRegisterReturn } from "react-hook-form";

import { BaseInput } from "./BaseInput";

interface PasswordInputProps {
  register: UseFormRegisterReturn;
  placeholder?: string;
  isDisabled?: boolean;
  invalid?: boolean;
}

export function PasswordInput({
  register,
  placeholder = "비밀번호",
  isDisabled,
  invalid,
}: PasswordInputProps) {
  return (
    <BaseInput
      disabled={isDisabled}
      invalid={invalid}
      placeholder={placeholder}
      register={register}
      type="password"
    />
  );
}
