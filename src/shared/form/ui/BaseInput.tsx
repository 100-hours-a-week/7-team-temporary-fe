import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Input } from "@/shared/ui";

interface BaseInputProps extends InputHTMLAttributes<HTMLInputElement> {
  register: UseFormRegisterReturn;
}

export function BaseInput({ register, className, ...props }: BaseInputProps) {
  return (
    <Input
      className={className}
      {...props}
      {...register}
    />
  );
}
