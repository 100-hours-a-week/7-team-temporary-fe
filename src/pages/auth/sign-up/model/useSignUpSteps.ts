import { useState } from "react";

export const ONBOARDING_STEPS = ["profile", "focusTime", "sleepTime", "terms"] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
export type SignUpFlowStep = "start" | OnboardingStep;

export function useSignUpSteps() {
  const [step, setStep] = useState<SignUpFlowStep>("start");

  const onboardingIndex = ONBOARDING_STEPS.indexOf(step as OnboardingStep);
  const isOnboarding = onboardingIndex !== -1;
  const isFirstOnboardingStep = onboardingIndex === 0;
  const isLastOnboardingStep = onboardingIndex === ONBOARDING_STEPS.length - 1;

  const next = () => {
    if (step === "start") {
      setStep(ONBOARDING_STEPS[0]);
      return;
    }

    if (!isLastOnboardingStep) {
      setStep(ONBOARDING_STEPS[onboardingIndex + 1]);
    }
  };

  const prev = () => {
    if (!isFirstOnboardingStep) {
      setStep(ONBOARDING_STEPS[onboardingIndex - 1]);
    }
  };

  return {
    step,
    isOnboarding,
    onboardingIndex,
    totalOnboardingSteps: ONBOARDING_STEPS.length,
    isFirstOnboardingStep,
    isLastOnboardingStep,
    next,
    prev,
  };
}
