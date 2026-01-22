import { OnboardingQuestionLayout } from "@/widgets/auth/onboarding/ui";

const TERMS = [
  { id: "age", label: "만 14세 이상입니다.", required: true },
  { id: "service", label: "서비스 이용약관 동의", required: true },
  { id: "privacy", label: "개인정보 수집 및 이용 동의", required: true },
  { id: "marketing", label: "마케팅 정보 수신 동의", required: false },
];

export function TermsStep() {
  return (
    <OnboardingQuestionLayout
      title="마지막 단계에요, 서비스를 이용하기 위한 약관입니다."
      description="원활한 서비스 이용을 위해 약관 동의가 필요해요."
    >
      <div className="flex flex-col gap-3">
        {TERMS.map((term) => (
          <label
            key={term.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-4 py-3"
          >
            <span className="flex items-center gap-2 text-sm text-neutral-900">
              <input
                type="checkbox"
                name={term.id}
                className="h-4 w-4 accent-neutral-900"
              />
              {term.label}
            </span>
            <span className={`text-xs ${term.required ? "text-red-500" : "text-neutral-500"}`}>
              {term.required ? "필수" : "선택"}
            </span>
          </label>
        ))}
      </div>
    </OnboardingQuestionLayout>
  );
}
