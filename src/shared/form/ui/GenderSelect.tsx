import type { UseFormRegisterReturn } from "react-hook-form";

interface GenderSelectProps {
  register: UseFormRegisterReturn;
  isDisabled?: boolean;
}

export function GenderSelect({ register, isDisabled }: GenderSelectProps) {
  return (
    <select
      className="w-full rounded-md border px-3 py-2"
      disabled={isDisabled}
      {...register}
    >
      <option value="MALE">남성</option>
      <option value="FEMALE">여성</option>
    </select>
  );
}
