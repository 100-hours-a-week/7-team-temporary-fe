import type { UseFormRegisterReturn } from "react-hook-form";
import { BaseInput } from "./BaseInput";

interface EmailInputProps {
  register: UseFormRegisterReturn;
  invalid?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
}

export function EmailInput({
  register,
  invalid,
  isDisabled,
  placeholder = "이메일을 입력해주세요",
}: EmailInputProps) {
  return (
    <BaseInput
      type="email"
      placeholder={placeholder}
      disabled={isDisabled}
      invalid={invalid}
      register={register}
    />
  );
}
