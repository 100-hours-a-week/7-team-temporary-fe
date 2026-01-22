"use client";

import { useFormContext } from "react-hook-form";

import type { SignUpFormModel } from "@/features/auth/sign-up/model";
import { FocusTimeZoneSelect, FormField } from "@/shared/form/ui";
import { OnboardingQuestionLayout } from "@/widgets/auth/onboarding/ui";

export function FocusTimeStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SignUpFormModel>();
  const focusTimeZoneError = errors.focusTimeZone?.message?.toString();

  return (
    <OnboardingQuestionLayout
      title={
        <>
          <span className="flex w-full max-w-[264px] flex-wrap">
            하루 중 가장 집중이 잘되는 시간대가 언제인가요?
          </span>
        </>
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
