import type { UseFormRegisterReturn } from "react-hook-form";

import { BaseInput } from "@/shared/form/ui";

interface PasswordInputProps {
  register: UseFormRegisterReturn;
  isDisabled?: boolean;
}

export function PasswordInput({ register, isDisabled }: PasswordInputProps) {
  return (
    <BaseInput
      disabled={isDisabled}
      placeholder="password"
      register={register}
      type="password"
    />
  );
}
