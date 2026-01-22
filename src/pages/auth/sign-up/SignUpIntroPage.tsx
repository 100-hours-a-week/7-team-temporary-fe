"use client";

import { useEffect } from "react";

import type { SignUpFlowStep } from "@/features/auth/sign-up/model";
import { useSignUpSteps } from "@/features/auth/sign-up/model";
import { SignUpFormContainer, useSignUpFormContext } from "@/features/auth/sign-up/ui";
import { FocusTimeStep, ProfileStep, SleepTimeStep, StartStep, TermsStep } from "./ui/steps/index";
import { PrimaryButton } from "@/shared/ui/button";
import { OnboardingStepBar } from "@/widgets/auth/onboarding/ui";
import { useStackPage } from "@/widgets/stack";

/**
 * 회원가입 인트로 화면
 */
export function SignUpIntroPage() {
  return (
    <SignUpFormContainer>
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

      <div className="mb-2.5 flex w-full gap-2">
        {!isOnboarding ? (
          <PrimaryButton onClick={next}>시작하기</PrimaryButton>
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
      </div>
    </div>
  );
}

/**
 * 스텝에 따른 인트로 텍스트
 */
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

  return <section className="flex flex-1 justify-center">{content}</section>;
}
