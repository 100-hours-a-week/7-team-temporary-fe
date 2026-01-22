"use client";

import { LoginFormContainer } from "@/features/auth/login/ui";
import { SignUpIntroPage } from "@/pages/auth/sign-up/intro";
import { Icon, useStackPage } from "@/shared/ui";

export function LoginPage() {
  const { push } = useStackPage();

  return (
    <>
      <div>
        <div className="text-xl font-bold text-neutral-500">
          몰입이 시작되는 <br />
          가장 작은 단위
        </div>
        <Icon
          name="logoDefault"
          className="h-auto w-full max-w-[200px] shrink"
        />
      </div>
      <LoginFormContainer onGoToSignUp={() => push(<SignUpIntroPage />)} />
    </>
  );
}
