import type { UseFormRegisterReturn } from "react-hook-form";

import { BaseInput } from "./BaseInput";

interface PasswordInputProps {
  register: UseFormRegisterReturn;
  placeholder?: string;
  isDisabled?: boolean;
}

export function PasswordInput({
  register,
  placeholder = "비밀번호",
  isDisabled,
}: PasswordInputProps) {
  return (
    <BaseInput
      disabled={isDisabled}
      placeholder={placeholder}
      register={register}
      type="password"
    />
  );
}
