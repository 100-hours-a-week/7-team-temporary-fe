"use client";

import { useCallback, useEffect } from "react";

import type { AuthState } from "@/entities/user";
import { useAuthStore } from "@/entities";
import { useLoginMutation } from "@/features/auth";
import { FixedActionBar } from "@/shared/ui/button/fixed-action-bar";
import { PrimaryButton } from "@/shared/ui/button/primary";
import { AnimatedStar } from "./ui/steps/AnimatedStar";

interface SignUpSuccessPageProps {
  autoLoginCredential?: {
    email: string;
    password: string;
  };
}

export function SignUpSuccessPage({ autoLoginCredential }: SignUpSuccessPageProps) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);
  const setAuthenticated = useAuthStore((state: AuthState) => state.setAuthenticated);
  const setSuppressPublicRedirect = useAuthStore(
    (state: AuthState) => state.setSuppressPublicRedirect,
  );
  const loginMutation = useLoginMutation();
  const title = "정보 기입이 완료되었어요!";
  const description = "내 완벽한 하루를\n시작해볼까요?";

  useEffect(() => {
    setSuppressPublicRedirect(true);
    return () => setSuppressPublicRedirect(false);
  }, [setSuppressPublicRedirect]);

  const handleAutoLoginClick = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        if (autoLoginCredential?.email && autoLoginCredential.password) {
          await loginMutation.mutateAsync({
            email: autoLoginCredential.email,
            password: autoLoginCredential.password,
          });
          setAuthenticated();
        }
      }
      setSuppressPublicRedirect(false);
    } catch (error) {
      console.warn("[SignUpSuccessPage] auto login failed", error);
    }
  }, [
    isAuthenticated,
    autoLoginCredential,
    loginMutation,
    setAuthenticated,
    setSuppressPublicRedirect,
  ]);

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-6 px-[30px] pt-5 pb-5">
      <section className="text-ink-900 mx-auto flex max-w-[290px] flex-1 flex-col items-center justify-center gap-6 text-center">
        <AnimatedStar name="starGreen" />
        <p className="text-lg font-semibold">{title}</p>
        <p className="mb-12 text-center text-2xl leading-9 font-bold whitespace-pre-line">
          {description}
        </p>
      </section>

      <FixedActionBar>
        <PrimaryButton
          className="w-full"
          disabled={loginMutation.isPending}
          onClick={() => void handleAutoLoginClick()}
        >
          자동 로그인
        </PrimaryButton>
      </FixedActionBar>
    </div>
  );
}
