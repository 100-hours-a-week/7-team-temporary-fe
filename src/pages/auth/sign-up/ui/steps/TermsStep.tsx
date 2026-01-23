import { Icon, IconButton } from "@/shared/ui";
import { OnboardingQuestionLayout } from "@/widgets/auth/onboarding/ui";

const TERMS = [
  { id: "service", label: "[필수] 서비스 이용약관 동의", required: true },
  { id: "privacy", label: "[필수] 개인정보 수집 및 이용 동의", required: true },
  { id: "marketing", label: "[선택] 마케팅 정보 수신 동의", required: false },
];

export function TermsStep() {
  return (
    <OnboardingQuestionLayout
      title={
        <>
          마지막 단계에요,
          <br />
          서비스를 이용하기 위한 약관입니다.
        </>
      }
      description="원활한 서비스 이용을 위해 약관 동의가 필요해요."
    >
      <div className="flex w-full flex-col gap-0">
        {TERMS.map((term) => (
          <label
            key={term.id}
            className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-[9px]"
          >
            <span className="flex items-center gap-2 text-sm text-neutral-900">
              <input
                type="checkbox"
                name={term.id}
                className="h-4 w-4 accent-neutral-900"
              />
              {term.label}
            </span>
            <IconButton
              icon="next"
              label="다음"
              onClick={() => {}}
              className="text-neutral-500"
            />
          </label>
        ))}
      </div>
    </OnboardingQuestionLayout>
  );
}
