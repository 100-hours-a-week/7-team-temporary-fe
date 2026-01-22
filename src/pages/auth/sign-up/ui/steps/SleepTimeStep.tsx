"use client";

import { SleepTimePicker } from "@/features/auth/sign-up/ui";
import { OnboardingQuestionLayout } from "@/widgets/auth/onboarding/ui";

export function SleepTimeStep() {
  return (
    <OnboardingQuestionLayout
      title={
        <>
          <span className="flex w-full max-w-[200px] flex-wrap">
            하루 마무리 시간을 알려주세요!
          </span>
        </>
      }
      description="수면 시간을 설정해주세요."
    >
      <SleepTimePicker />
    </OnboardingQuestionLayout>
  );
}
