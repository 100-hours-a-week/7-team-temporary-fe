"use client";

import { useEffect } from "react";

import type { SignUpFlowStep } from "./model";
import { useOnboardingStepNextEnabled, useSignUpSteps } from "./model";
import { SignUpFormContainer, useSignUpFormContext } from "./ui/SignUpFormContainer";
import { FocusTimeStep, ProfileStep, SleepTimeStep, StartStep, TermsStep } from "./ui/steps/index";
import { FixedActionBar } from "@/shared/ui/button/fixed-action-bar";
import { PrimaryButton } from "@/shared/ui/button/primary";
import { OnboardingStepBar } from "@/widgets/auth";
import type { AuthState } from "@/entities/user";
import { useAuthStore } from "@/entities";
import { useStackPage } from "@/widgets/stack";
import { SignUpSuccessPage } from "./SignUpSuccessPage";
import { registerFcmToken } from "@/shared/firebase";

/**
 * 회원가입 인트로 화면
 */
export function SignUpIntroPage() {
  const { push } = useStackPage();
  const setAuthenticated = useAuthStore((state: AuthState) => state.setAuthenticated);
  const setSuppressPublicRedirect = useAuthStore(
    (state: AuthState) => state.setSuppressPublicRedirect,
  );

  return (
    <SignUpFormContainer
      onSuccess={(data, form) => {
        setSuppressPublicRedirect(true);
        setAuthenticated();
        void registerFcmToken({ promptPermission: true }).catch((error) => {
          console.warn("[FCM] token register failed after sign up", error);
        });
        push(
          <SignUpSuccessPage
            autoLoginCredential={{
              email: form.email,
              password: form.password,
            }}
          />,
        );
      }}
    >
      <SignUpIntroContent />
    </SignUpFormContainer>
  );
}

function SignUpIntroContent() {
  const {
    step,
    isOnboarding,
    onboardingIndex,
    totalOnboardingSteps,
    isFirstOnboardingStep,
    isLastOnboardingStep,
    next,
    prev,
  } = useSignUpSteps();
  const { canSubmit, control, submitForm } = useSignUpFormContext();
  const { setHeaderContent } = useStackPage();
  const isCurrentStepReady = useOnboardingStepNextEnabled({ step, control });

  useEffect(() => {
    if (!isOnboarding || totalOnboardingSteps <= 0) {
      setHeaderContent(null);
      return;
    }

    setHeaderContent(
      <OnboardingStepBar
        step={onboardingIndex}
        totalSteps={totalOnboardingSteps}
      />,
    );

    return () => setHeaderContent(null);
  }, [isOnboarding, onboardingIndex, setHeaderContent, totalOnboardingSteps]);

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-6 px-[30px] pt-5 pb-5">
      <SignUpStepRenderer step={step} />

      <FixedActionBar>
        {!isOnboarding ? (
          <PrimaryButton
            className="w-full"
            onClick={next}
          >
            시작하기
          </PrimaryButton>
        ) : (
          <>
            {isFirstOnboardingStep ? null : (
              <PrimaryButton
                onClick={prev}
                className="bg-gray-300 text-gray-500 hover:bg-gray-300"
              >
                뒤로
              </PrimaryButton>
            )}
            {isLastOnboardingStep ? (
              <PrimaryButton
                onClick={submitForm}
                disabled={!canSubmit}
              >
                회원가입
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={next}
                disabled={!isCurrentStepReady}
              >
                다음
              </PrimaryButton>
            )}
          </>
        )}
      </FixedActionBar>
    </div>
  );
}

//스텝에 따른 인트로 텍스트

function SignUpStepRenderer({ step }: { step: SignUpFlowStep }) {
  const content = (() => {
    switch (step) {
      case "start":
        return <StartStep />;
      case "profile":
        return <ProfileStep />;
      case "focusTime":
        return <FocusTimeStep />;
      case "sleepTime":
        return <SleepTimeStep />;
      case "terms":
        return <TermsStep />;
      default: {
        const exhaustiveCheck: never = step;
        return exhaustiveCheck;
      }
    }
  })();

  return <section className="flex flex-1 flex-col gap-4">{content}</section>;
}
