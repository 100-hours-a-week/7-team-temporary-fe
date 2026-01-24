"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { SplitText } from "@/shared/ui";

import type { SignUpFormModel } from "@/features/auth/sign-up/model";
import { SleepTimePicker } from "@/features/auth/sign-up/ui";
import { FormField } from "@/shared/form/ui";
import { OnboardingQuestionLayout } from "@/widgets/auth/onboarding/ui";

type SleepTimeValue = {
  hour: number;
  minute: number;
};

const DEFAULT_TIME: SleepTimeValue = { hour: 22, minute: 30 };

const formatTime = ({ hour, minute }: SleepTimeValue) =>
  `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

export function SleepTimeStep() {
  const titleText = "하루 마무리 시간을 알려주세요!";
  const handleAnimationComplete = () => {};
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<SignUpFormModel>();
  const [timeValue, setTimeValue] = useState<SleepTimeValue>(DEFAULT_TIME);
  const dayEndTimeError = errors.dayEndTime?.message?.toString();

  useEffect(() => {
    register("dayEndTime");
    setValue("dayEndTime", formatTime(DEFAULT_TIME), { shouldValidate: true });
  }, [register, setValue]);

  const handleTimeChange = (nextValue: SleepTimeValue) => {
    setTimeValue(nextValue);
    setValue("dayEndTime", formatTime(nextValue), { shouldDirty: true, shouldValidate: true });
  };

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
      <FormField
        label=""
        error={dayEndTimeError}
      >
        <SleepTimePicker
          value={timeValue}
          onChange={handleTimeChange}
        />
      </FormField>
    </OnboardingQuestionLayout>
  );
}
