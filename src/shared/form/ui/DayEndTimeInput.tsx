import type { UseFormRegisterReturn } from "react-hook-form";

import { BaseInput } from "./BaseInput";

interface DayEndTimeInputProps {
  register: UseFormRegisterReturn;
  placeholder?: string;
  isDisabled?: boolean;
}

export function DayEndTimeInput({
  register,
  placeholder = "HH:MM",
  isDisabled,
}: DayEndTimeInputProps) {
  return (
    <BaseInput
      disabled={isDisabled}
      placeholder={placeholder}
      register={register}
      type="text"
    />
  );
}
