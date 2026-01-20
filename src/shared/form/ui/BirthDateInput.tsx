import type { UseFormRegisterReturn } from "react-hook-form";

import { BaseInput } from "./BaseInput";

interface BirthDateInputProps {
  register: UseFormRegisterReturn;
  placeholder?: string;
  isDisabled?: boolean;
}

export function BirthDateInput({
  register,
  placeholder = "YYYY.MM.DD",
  isDisabled,
}: BirthDateInputProps) {
  return (
    <BaseInput
      disabled={isDisabled}
      placeholder={placeholder}
      register={register}
      type="text"
    />
  );
}
