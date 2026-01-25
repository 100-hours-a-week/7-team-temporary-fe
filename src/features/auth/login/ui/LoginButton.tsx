"use client";

import type { ComponentProps } from "react";

import { PrimaryButton } from "@/shared/ui";
import { useToast } from "@/shared/ui/toast";
import type { ToastType } from "@/shared/ui/toast";

//Omit : 특정 속성을 제외한 타입 생성 예시 : Omit<햄버거세트, "콜라">
type LoginButtonProps = Omit<ComponentProps<typeof PrimaryButton>, "children"> & {
  toastMessage?: string;
  toastType?: ToastType;
};

export function LoginButton({
  className,
  toastMessage = "아이디 또는 비밀번호를 확인해주세요.",
  toastType = "info",
  onClick,
  ...props
}: LoginButtonProps) {
  const { showToast } = useToast();

  const handleClick: LoginButtonProps["onClick"] = (event) => {
    showToast(toastMessage, toastType);

    onClick?.(event);
  };

  return (
    <PrimaryButton
      className={className}
      loadingText="로그인 중..."
      type="submit"
      onClick={handleClick}
      {...props}
    >
      로그인
    </PrimaryButton>
  );
}
