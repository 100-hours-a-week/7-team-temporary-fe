"use client";

import { useEffect } from "react";

import type { SignUpFlowStep } from "@/pages/auth/sign-up/model";
import { useSignUpSteps } from "@/pages/auth/sign-up/model";
import {
  SignUpFormContainer,
  useSignUpFormContext,
} from "@/pages/auth/sign-up/ui/SignUpFormContainer";
import { FocusTimeStep, ProfileStep, SleepTimeStep, StartStep, TermsStep } from "./ui/steps/index";
import { FixedActionBar, PrimaryButton } from "@/shared/ui/button";
import { OnboardingStepBar } from "@/widgets/auth/onboarding/ui";
import type { AuthState } from "@/shared/auth";
import { useAuthStore } from "@/entities";
import { useStackPage } from "@/widgets/stack";
import { SignUpSuccessPage } from "./SignUpSuccessPage";

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
      onSuccess={(data) => {
        setSuppressPublicRedirect(true);
        setAuthenticated(data.accessToken);
        push(<SignUpSuccessPage />);
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
  const { canSubmit, submitForm } = useSignUpFormContext();
  const { setHeaderContent } = useStackPage();

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
              <PrimaryButton onClick={next}>다음</PrimaryButton>
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
