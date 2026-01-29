"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useFormContext, useWatch } from "react-hook-form";

import { Endpoint } from "@/shared/api";
import { useApiQuery } from "@/shared/query";

import type { SignUpFormModel } from "@/features/auth/sign-up/model";
import { Icon, SplitText } from "@/shared/ui";
import { OnboardingQuestionLayout } from "@/widgets/auth/onboarding/ui";

const TERMS = [
  {
    id: 2,
    label: "[필수] 서비스 이용약관 동의",
    required: true,
    href: "https://wide-legend-7e1.notion.site/2f4ee90a967f8141bb7dc3cc8968fa79?source=copy_link",
  },
  {
    id: 1,
    label: "[필수] 개인정보 수집 및 이용 동의",
    required: true,
    href: "https://wide-legend-7e1.notion.site/2f4ee90a967f8155a0ebc4c9616ba4e7?pvs=73",
  },
  {
    id: 3,
    label: "[선택] 마케팅 정보 수신 동의",
    required: false,
    href: "https://wide-legend-7e1.notion.site/2f4ee90a967f81f080eec2327efef776?source=copy_link",
  },
];

type TermsResponseItem = {
  termsId: number;
  name: string;
  termsType: "MANDATORY" | "OPTIONAL";
};

function TermsSkeleton() {
  return (
    <div className="w-full">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex w-full items-center justify-between gap-3 rounded-lg px-0 py-[9px]"
        >
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-sm bg-neutral-200" />
            <div className="h-4 w-48 rounded-full bg-neutral-200" />
          </div>
          <div className="h-4 w-4 rounded-full bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}

export function TermsStep() {
  const titleText = "마지막 단계에요, 서비스를 이용하기 위한 약관입니다.";
  const descriptionText = "원활한 서비스 이용을 위해 약관 동의가 필요해요.";
  const handleAnimationComplete = () => {};
  const { data } = useApiQuery<TermsResponseItem[]>({
    queryKey: ["terms"],
    url: Endpoint.TERMS.LIST,
  });

  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<SignUpFormModel>();
  const formTerms = useWatch({ control, name: "terms" }) ?? [];

  const termsById = new Map(data?.map((term) => [term.termsId, term]));
  const visibleTerms = data ? TERMS.filter((term) => termsById.has(term.id)) : [];
  const termsError = typeof errors.terms?.message === "string" ? errors.terms.message : undefined;

  const nextTerms = useMemo(
    () =>
      visibleTerms.map((term) => {
        const existing = formTerms.find((item) => item.termsId === term.id);
        return { termsId: term.id, isAgreed: existing?.isAgreed ?? false };
      }),
    [formTerms, visibleTerms],
  );

  useEffect(() => {
    if (!data) return;
    const isSame =
      formTerms.length === nextTerms.length &&
      formTerms.every(
        (item, index) =>
          item.termsId === nextTerms[index]?.termsId &&
          item.isAgreed === nextTerms[index]?.isAgreed,
      );
    if (isSame) return;
    setValue("terms", nextTerms, { shouldValidate: true, shouldDirty: false });
  }, [data, formTerms, nextTerms, setValue]);

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
          {!data ? <TermsSkeleton /> : null}
          {data && visibleTerms.length === 0 ? (
            <div className="w-full py-4 text-sm text-neutral-400">
              약관 정보를 불러오지 못했습니다.
            </div>
          ) : null}
          {visibleTerms.map((term, index) => {
            const remoteTerm = termsById.get(term.id);
            const label = remoteTerm?.name ?? term.label;
            return (
              <label
                key={term.id}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-0 py-[9px]"
              >
                <span className="flex items-center gap-2 text-sm text-neutral-900">
                  <input
                    type="checkbox"
                    {...register(`terms.${index}.isAgreed` as const)}
                    className="h-4 w-4 accent-neutral-900"
                  />
                  <input
                    type="hidden"
                    {...register(`terms.${index}.termsId` as const)}
                    value={term.id}
                  />
                  {label}
                </span>
                <Link
                  href={term.href}
                  aria-label={`${label} 상세 보기`}
                  title={`${label} 상세 보기`}
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
            );
          })}
          {termsError ? <p className="w-full pt-2 text-xs text-red-500">{termsError}</p> : null}
        </div>
      </div>
    </OnboardingQuestionLayout>
  );
}
