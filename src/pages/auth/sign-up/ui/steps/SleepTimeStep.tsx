"use client";

import { SplitText } from "@/shared/ui";

import { SleepTimePicker } from "@/features/auth/sign-up/ui";
import { OnboardingQuestionLayout } from "@/widgets/auth/onboarding/ui";

export function SleepTimeStep() {
  const titleText = "하루 마무리 시간을 알려주세요!";
  const handleAnimationComplete = () => {};
  return (
    <OnboardingQuestionLayout
      title={
        <SplitText
          text={titleText}
          delay={30}
          duration={1.25}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="left"
          tag="span"
          onLetterAnimationComplete={handleAnimationComplete}
        />
      }
      description="수면 시간을 설정해주세요."
      contentClassName="gap-[37px] pt-[93px] pb-[93px]"
    >
      <SleepTimePicker />
    </OnboardingQuestionLayout>
  );
}
