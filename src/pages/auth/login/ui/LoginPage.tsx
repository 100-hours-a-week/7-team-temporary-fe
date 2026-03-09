"use client";

import { useCallback, useRef } from "react";
import type { ComponentType } from "react";

import { LoginFormContainer } from "@/features/auth";
import { useStackPage } from "@/widgets/stack";

export function LoginPage() {
  const { push } = useStackPage();
  const signUpIntroModulePromiseRef = useRef<Promise<{ SignUpIntroPage: ComponentType }> | null>(
    null,
  );

  const preloadSignUpIntroPage = useCallback(() => {
    if (!signUpIntroModulePromiseRef.current) {
      signUpIntroModulePromiseRef.current = import("@/pages/sign-up");
    }
    return signUpIntroModulePromiseRef.current;
  }, []);

  const handleGoToSignUp = () => {
    void (async () => {
      const { SignUpIntroPage } = await preloadSignUpIntroPage();
      push(<SignUpIntroPage />);
    })();
  };

  return (
    <LoginFormContainer
      onGoToSignUp={handleGoToSignUp}
      onPrepareSignUp={preloadSignUpIntroPage}
    />
  );
}
