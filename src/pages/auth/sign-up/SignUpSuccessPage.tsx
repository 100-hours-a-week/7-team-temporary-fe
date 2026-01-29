"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { AuthState } from "@/shared/auth";
import { useAuthStore } from "@/entities";
import { FixedActionBar, PrimaryButton } from "@/shared/ui/button";
import { AnimatedStar } from "./ui/steps/AnimatedStar";

export function SignUpSuccessPage() {
  const router = useRouter();
  const setSuppressPublicRedirect = useAuthStore(
    (state: AuthState) => state.setSuppressPublicRedirect,
  );
  const title = "정보 기입이 완료되었어요!";
  const description = "내 완벽한 하루를\n시작해볼까요?";

  useEffect(() => {
    setSuppressPublicRedirect(true);
    return () => setSuppressPublicRedirect(false);
  }, [setSuppressPublicRedirect]);

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
          onClick={() => {
            setSuppressPublicRedirect(false);
            router.replace("/home");
          }}
        >
          자동 로그인
        </PrimaryButton>
      </FixedActionBar>
    </div>
  );
}
