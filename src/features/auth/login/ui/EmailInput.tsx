import type { UseFormRegisterReturn } from "react-hook-form";

import { BaseInput } from "@/shared/form/ui";

interface EmailInputProps {
  register: UseFormRegisterReturn;
  isDisabled?: boolean;
}

export function EmailInput({ register, isDisabled }: EmailInputProps) {
  return (
    <BaseInput
      disabled={isDisabled}
      placeholder="email@email.com"
      register={register}
      type="email"
    />
  );
}
