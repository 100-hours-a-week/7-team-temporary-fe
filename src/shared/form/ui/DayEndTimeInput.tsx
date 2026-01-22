import type { UseFormRegisterReturn } from "react-hook-form";

import { BaseInput } from "./BaseInput";

interface DayEndTimeInputProps {
  register: UseFormRegisterReturn;
  placeholder?: string;
  isDisabled?: boolean;
  invalid?: boolean;
}

export function DayEndTimeInput({
  register,
  placeholder = "HH:MM",
  isDisabled,
  invalid,
}: DayEndTimeInputProps) {
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
