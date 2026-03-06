import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { SignUpFormModel } from "@/features/auth";

import type { SignUpFlowStep } from "./useSignUpSteps";

const REQUIRED_TERMS_IDS = [1, 2] as const;

interface UseOnboardingStepNextEnabledParams {
  step: SignUpFlowStep;
  control: Control<SignUpFormModel>;
}

const hasText = (value: string | null | undefined) =>
  typeof value === "string" && value.trim().length > 0;

const hasRequiredTerms = (terms: SignUpFormModel["terms"] | undefined) => {
  if (!terms?.length) return false;
  return REQUIRED_TERMS_IDS.every((requiredId) =>
    terms.some((term) => term.termsId === requiredId && term.isAgreed),
  );
};

export function useOnboardingStepNextEnabled({
  step,
  control,
}: UseOnboardingStepNextEnabledParams) {
  const email = useWatch({ control, name: "email" });
  const password = useWatch({ control, name: "password" });
  const isEmailChecked = useWatch({ control, name: "isEmailChecked" });
  const nickname = useWatch({ control, name: "nickname" });
  const gender = useWatch({ control, name: "gender" });
  const birth = useWatch({ control, name: "birth" });
  const focusTimeZone = useWatch({ control, name: "focusTimeZone" });
  const dayEndTime = useWatch({ control, name: "dayEndTime" });
  const terms = useWatch({ control, name: "terms" });

  return useMemo(() => {
    if (step === "start") return true;

    if (step === "profile") {
      return (
        hasText(email) &&
        isEmailChecked &&
        hasText(password) &&
        hasText(nickname) &&
        hasText(birth) &&
        (gender === "MALE" || gender === "FEMALE")
      );
    }

    if (step === "focusTime") {
      return hasText(focusTimeZone);
    }

    if (step === "sleepTime") {
      return hasText(dayEndTime);
    }

    if (step === "terms") {
      return hasRequiredTerms(terms);
    }

    return false;
  }, [
    birth,
    dayEndTime,
    email,
    focusTimeZone,
    gender,
    isEmailChecked,
    nickname,
    password,
    step,
    terms,
  ]);
}
