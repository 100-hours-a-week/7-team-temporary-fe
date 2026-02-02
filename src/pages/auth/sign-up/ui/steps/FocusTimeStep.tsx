"use client";

import { useFormContext } from "react-hook-form";
import { SplitText } from "@/shared/ui";

import type { SignUpFormModel } from "@/features/auth/sign-up/model";
import { FocusTimeZoneSelect, FormField } from "@/shared/form/ui";
import { OnboardingQuestionLayout } from "@/widgets/auth/onboarding/ui";

export function FocusTimeStep() {
  const titleText = "하루 중 가장 집중이 잘되는 시간대가 언제인가요?";
  const handleAnimationComplete = () => {};
  const {
    register,
    formState: { errors },
  } = useFormContext<SignUpFormModel>();
  const focusTimeZoneError = errors.focusTimeZone?.message?.toString();

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
      description="한가지만 선택해주세요."
    >
      <FormField
        label=""
        error={focusTimeZoneError}
      >
        <FocusTimeZoneSelect
          invalid={!!errors.focusTimeZone}
          register={register("focusTimeZone")}
        />
      </FormField>
    </OnboardingQuestionLayout>
  );
}
