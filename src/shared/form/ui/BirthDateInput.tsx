import type { UseFormRegisterReturn } from "react-hook-form";

import { BaseInput } from "./BaseInput";

interface BirthDateInputProps {
  register: UseFormRegisterReturn;
  placeholder?: string;
  isDisabled?: boolean;
  invalid?: boolean;
}

export function BirthDateInput({
  register,
  placeholder = "YYYY.MM.DD",
  isDisabled,
  invalid,
}: BirthDateInputProps) {
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
