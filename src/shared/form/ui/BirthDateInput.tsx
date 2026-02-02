import type { ChangeHandler, UseFormRegisterReturn } from "react-hook-form";

import { BaseInput } from "./BaseInput";

interface BirthDateInputProps {
  register: UseFormRegisterReturn;
  placeholder?: string;
  isDisabled?: boolean;
  invalid?: boolean;
}

export function BirthDateInput({
  register,
  placeholder = "0000.00.00",
  isDisabled,
  invalid,
}: BirthDateInputProps) {
  const handleChange: ChangeHandler = (event) => {
    const target = event.target as HTMLInputElement;
    const digits = target.value.replace(/\D/g, "").slice(0, 8);
    const parts = [];
    if (digits.length > 0) parts.push(digits.slice(0, 4));
    if (digits.length > 4) parts.push(digits.slice(4, 6));
    if (digits.length > 6) parts.push(digits.slice(6, 8));
    target.value = parts.join(".");
    return register.onChange(event);
  };
  const registerProps = { ...register, onChange: handleChange };

  return (
    <BaseInput
      disabled={isDisabled}
      invalid={invalid}
      placeholder={placeholder}
      register={registerProps}
      inputMode="numeric"
      maxLength={10}
      onChange={handleChange}
      type="text"
    />
  );
}
