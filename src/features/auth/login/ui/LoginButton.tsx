"use client";

import type { ComponentProps } from "react";

import { PrimaryButton } from "@/shared/ui";

//Omit : 특정 속성을 제외한 타입 생성 예시 : Omit<햄버거세트, "콜라">
type LoginButtonProps = Omit<ComponentProps<typeof PrimaryButton>, "children">;

export function LoginButton({ className, ...props }: LoginButtonProps) {
  return (
    <PrimaryButton
      className={className}
      loadingText="로그인 중..."
      type="submit"
      {...props}
    >
      로그인
    </PrimaryButton>
  );
}
