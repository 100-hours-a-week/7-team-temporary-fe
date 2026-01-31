"use client";

import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Icon } from "@/shared/ui/icon";

import { BaseInput } from "./BaseInput";

interface PasswordInputProps {
  register: UseFormRegisterReturn;
  placeholder?: string;
  isDisabled?: boolean;
  invalid?: boolean;
}

export function PasswordInput({
  register,
  placeholder = "비밀번호",
  isDisabled,
  invalid,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <BaseInput
        disabled={isDisabled}
        invalid={invalid}
        placeholder={placeholder}
        register={register}
        type={isVisible ? "text" : "password"}
        className="pr-12"
      />
      <button
        type="button"
        aria-label={isVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
        aria-pressed={isVisible}
        disabled={isDisabled}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setIsVisible((prev) => !prev)}
      >
        <Icon
          name={isVisible ? "eye_off" : "eye"}
          className="h-5 w-5"
          aria-hidden="true"
          focusable="false"
        />
      </button>
    </div>
  );
}
