"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import type { AuthState } from "@/entities/user";
import { useAuthStore } from "@/entities";
import { AUTH_DEFAULT_AUTHENTICATED_PATH, AUTH_LOGIN_PATH, AuthService } from "@/shared/auth";
import { FixedActionBar, PrimaryButton } from "@/shared/ui/button";
import { AnimatedStar } from "./ui/steps/AnimatedStar";

export function SignUpSuccessPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state: AuthState) => state.accessToken);
  const setSuppressPublicRedirect = useAuthStore(
    (state: AuthState) => state.setSuppressPublicRedirect,
  );
  const title = "정보 기입이 완료되었어요!";
  const description = "내 완벽한 하루를\n시작해볼까요?";

  useEffect(() => {
    setSuppressPublicRedirect(true);
    return () => setSuppressPublicRedirect(false);
  }, [setSuppressPublicRedirect]);

  const handleAutoLoginClick = useCallback(async () => {
    try {
      if (!accessToken) {
        await AuthService.refresh();
      }
      setSuppressPublicRedirect(false);
      router.replace(AUTH_DEFAULT_AUTHENTICATED_PATH);
    } catch (error) {
      console.warn("[SignUpSuccessPage] auto login failed", error);
      setSuppressPublicRedirect(false);
      router.replace(AUTH_LOGIN_PATH);
    }
  }, [accessToken, router, setSuppressPublicRedirect]);

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
          onClick={() => void handleAutoLoginClick()}
        >
          자동 로그인
        </PrimaryButton>
      </FixedActionBar>
    </div>
  );
}
