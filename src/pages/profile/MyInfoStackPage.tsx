"use client";

import { useEffect } from "react";

import { useStackPage } from "@/widgets/stack";

import { MyInfoField } from "./ui/MyInfoField";
import { FixedActionBar, PrimaryButton } from "@/shared/ui/button";

export function MyInfoStackPage() {
  const { setHeaderContent } = useStackPage();

  useEffect(() => {
    setHeaderContent(<span className="text-xl font-semibold text-black">내 정보</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  return (
    <div className="flex h-fit w-full flex-col items-center justify-center px-10 py-[30px]">
      <div className="flex w-full flex-1 items-start justify-center">
        <div className="w-full rounded-3xl p-0">
          <div className="m-0 flex flex-col gap-[25px]">
            <MyInfoField
              label="이메일"
              labelAdornment={<span className="text-sm font-semibold text-red-500">변경불가</span>}
              value="happy7yong@naver.com"
              className="w-full flex-col items-start gap-3"
              labelClassName="text-base font-semibold text-neutral-900"
              inputClassName="w-full min-w-0 bg-neutral-200 text-neutral-400 pointer-events-none"
            />
            <div className="flex gap-6">
              <MyInfoField
                label="성별"
                value="여"
                className="flex-1"
                labelClassName="text-lg font-semibold text-neutral-900"
                inputClassName="w-full min-w-0 max-w-[78px] text-neutral-700"
              />
              <MyInfoField
                label="생년월일"
                value="1990.01.01"
                className="w-full max-w-[187px]"
                labelClassName="text-base font-semibold text-neutral-900"
                inputClassName="w-full min-w-0 text-neutral-700"
              />
            </div>
            <div className="flex items-end justify-end gap-4">
              <MyInfoField
                label="닉네임"
                value="쿠쿠루삥뽕"
                className="flex-1 flex-col items-start gap-3"
                labelClassName="text-base font-semibold text-neutral-900"
                inputClassName="w-full min-w-0 text-neutral-700"
              />
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
            <MyInfoField
              label="하루 집중 시간대"
              value="오전 8시 - 12시"
              className="flex-col items-start gap-3"
              labelClassName="text-lg font-semibold text-neutral-900"
              inputClassName="w-full min-w-0 text-neutral-900"
            />
            <MyInfoField
              label="하루 마무리 시간"
              value="오후 11시"
              className="flex-col items-start gap-3"
              labelClassName="text-lg font-semibold text-neutral-900"
              inputClassName="w-full min-w-0 text-neutral-900"
            />
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
