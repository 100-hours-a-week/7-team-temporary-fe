import type { UseFormRegisterReturn } from "react-hook-form";

import { BaseInput } from "./BaseInput";

interface ProfileImageKeyInputProps {
  register: UseFormRegisterReturn;
  placeholder?: string;
  isDisabled?: boolean;
}

export function ProfileImageKeyInput({
  register,
  placeholder = "profile-image-key",
  isDisabled,
}: ProfileImageKeyInputProps) {
  return (
    <BaseInput
      disabled={isDisabled}
      placeholder={placeholder}
      register={register}
      type="text"
    />
  );
}
