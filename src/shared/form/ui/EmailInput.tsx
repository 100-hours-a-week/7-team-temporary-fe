import type { UseFormRegisterReturn } from "react-hook-form";

import { BaseInput } from "./BaseInput";

interface EmailInputProps {
  register: UseFormRegisterReturn;
  placeholder?: string;
  isDisabled?: boolean;
}

export function EmailInput({
  register,
  placeholder = "email@email.com",
  isDisabled,
}: EmailInputProps) {
  return (
    <BaseInput
      disabled={isDisabled}
      placeholder={placeholder}
      register={register}
      type="email"
    />
  );
}
