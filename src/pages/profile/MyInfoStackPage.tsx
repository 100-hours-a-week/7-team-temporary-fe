"use client";

import { useEffect } from "react";

import { useStackPage } from "@/widgets/stack";
import { useMyProfileQuery } from "@/entities/user";

import { FixedActionBar, PrimaryButton } from "@/shared/ui/button";
import { FormField } from "@/shared/form/ui";

export function MyInfoStackPage() {
  const { setHeaderContent } = useStackPage();
  const { data: myProfile } = useMyProfileQuery();
  const inputClassName =
    "h-12 w-full rounded-xl border px-3 py-2 text-sm bg-neutral-50 placeholder:text-gray-400 border border-transparent focus:outline-none focus:ring-error/20 focus:ring-2 focus:ring-inset not-placeholder-shown:border-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400";

  const genderLabel =
    myProfile?.gender === "MALE" ? "남" : myProfile?.gender === "FEMALE" ? "여" : "";

  const focusTimeLabel = (() => {
    switch (myProfile?.focusTimeZone) {
      case "MORNING":
        return "오전";
      case "AFTERNOON":
        return "오후";
      case "EVENING":
        return "저녁";
      case "NIGHT":
        return "밤";
      default:
        return "";
    }
  })();

  const dayEndTimeLabel = (() => {
    const time = myProfile?.dayEndTime;
    if (!time) return "";
    const [hourText, minuteText] = time.split(":");
    const hour = Number(hourText);
    if (Number.isNaN(hour)) return time;
    const period = hour < 12 ? "오전" : "오후";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const minutes = minuteText && minuteText !== "00" ? ` ${minuteText}분` : "";
    return `${period} ${hour12}시${minutes}`;
  })();

  useEffect(() => {
    setHeaderContent(<span className="text-xl font-semibold text-black">내 정보</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  return (
    <div className="flex h-fit w-full flex-col items-center justify-center px-10 py-[30px]">
      <div className="flex w-full flex-1 items-start justify-center">
        <div className="w-full rounded-3xl p-0">
          <div className="m-0 flex flex-col gap-[25px]">
            <FormField
              label="이메일"
              labelAdornment={<span className="text-sm font-semibold text-red-500">변경불가</span>}
              className="w-full flex-col items-start gap-3"
              labelClassName="flex items-center gap-2 text-base font-semibold text-neutral-900"
            >
              <input
                type="email"
                value={myProfile?.email ?? ""}
                readOnly
                className={inputClassName}
                disabled
              />
            </FormField>
            <div className="flex items-end gap-6">
              <FormField
                label="성별"
                className="flex-1"
                labelClassName="text-lg font-semibold text-neutral-900"
              >
                <input
                  type="text"
                  value={genderLabel}
                  readOnly
                  className={inputClassName}
                />
              </FormField>
              <FormField
                label="생년월일"
                className="w-full max-w-[187px]"
                labelClassName="text-base font-semibold text-neutral-900"
              >
                <input
                  type="text"
                  value={myProfile?.birth ?? ""}
                  readOnly
                  className={inputClassName}
                />
              </FormField>
            </div>
            <div className="flex items-end justify-end gap-4">
              <FormField
                label="닉네임"
                className="flex-1 flex-col items-start gap-3"
                labelClassName="text-base font-semibold text-neutral-900"
              >
                <input
                  type="text"
                  value={myProfile?.nickname ?? ""}
                  readOnly
                  className={inputClassName}
                />
              </FormField>
              <div>
                <button
                  type="button"
                  className="h-12 shrink-0 rounded-full border border-neutral-900 px-5 py-2 text-base font-semibold text-neutral-900"
                >
                  중복확인
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold text-neutral-900">비밀번호 변경</div>
              <button
                type="button"
                className="shrink-0 rounded-full border border-neutral-900 px-5 py-2 text-base font-semibold text-neutral-900"
              >
                변경하기
              </button>
            </div>
            <div className="h-px w-full bg-neutral-200" />
            <FormField
              label="하루 집중 시간대"
              className="flex-col items-start gap-3"
              labelClassName="text-lg font-semibold text-neutral-900"
            >
              <input
                type="text"
                value={focusTimeLabel}
                readOnly
                className={inputClassName}
              />
            </FormField>
            <FormField
              label="하루 마무리 시간"
              className="flex-col items-start gap-3"
              labelClassName="text-lg font-semibold text-neutral-900"
            >
              <input
                type="text"
                value={dayEndTimeLabel}
                readOnly
                className={inputClassName}
              />
            </FormField>
          </div>
        </div>
      </div>
      <div className="h-[70px]"></div>
      <FixedActionBar>
        <PrimaryButton
          onClick={() => {}}
          className="w-full"
        >
          저장
        </PrimaryButton>
      </FixedActionBar>
    </div>
  );
}
