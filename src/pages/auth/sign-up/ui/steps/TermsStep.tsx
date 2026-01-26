import Link from "next/link";

import { SplitText } from "@/shared/ui";
import { Icon } from "@/shared/ui";
import { OnboardingQuestionLayout } from "@/widgets/auth/onboarding/ui";

const TERMS = [
  {
    id: "service",
    label: "[필수] 서비스 이용약관 동의",
    required: true,
    href: "https://wide-legend-7e1.notion.site/2f4ee90a967f8141bb7dc3cc8968fa79?source=copy_link",
  },
  {
    id: "privacy",
    label: "[필수] 개인정보 수집 및 이용 동의",
    required: true,
    href: "https://wide-legend-7e1.notion.site/2f4ee90a967f8155a0ebc4c9616ba4e7?pvs=73",
  },
  {
    id: "marketing",
    label: "[선택] 마케팅 정보 수신 동의",
    required: false,
    href: "https://wide-legend-7e1.notion.site/2f4ee90a967f81f080eec2327efef776?source=copy_link",
  },
];

export function TermsStep() {
  const titleText = "마지막 단계에요, 서비스를 이용하기 위한 약관입니다.";
  const descriptionText = "원활한 서비스 이용을 위해 약관 동의가 필요해요.";
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
      description={descriptionText}
      className="flex h-full flex-col"
      contentClassName="flex-1 justify-end"
    >
      <div className="mb-10 flex w-full flex-col">
        <div className="mb-[14px] box-content font-bold">약관동의</div>
        <div className="mb-[29px] flex w-full flex-col items-center justify-center gap-0">
          {TERMS.map((term) => (
            <label
              key={term.id}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-0 py-[9px]"
            >
              <span className="flex items-center gap-2 text-sm text-neutral-900">
                <input
                  type="checkbox"
                  name={term.id}
                  className="h-4 w-4 accent-neutral-900"
                />
                {term.label}
              </span>
              <Link
                href={term.href}
                aria-label={`${term.label} 상세 보기`}
                title={`${term.label} 상세 보기`}
                target="_blank"
                rel="noopener noreferrer"
                className="focus:ring-error/30 inline-flex items-center justify-center rounded-md text-neutral-400 focus:outline-none"
              >
                <Icon
                  name="next"
                  className="h-[18px] w-4"
                  aria-hidden="true"
                  focusable="false"
                />
              </Link>
            </label>
          ))}
        </div>
      </div>
    </OnboardingQuestionLayout>
  );
}
