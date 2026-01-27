"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { useStackPage } from "@/widgets/stack";
import {
  useMyProfileQuery,
  useUpdateMyProfileMutation,
  type UpdateMyProfileModel,
} from "@/entities/user";

import { FixedActionBar, PrimaryButton } from "@/shared/ui/button";
import { FormField } from "@/shared/form/ui";

const focusTimeOptions = [
  { value: "MORNING", label: "오전" },
  { value: "AFTERNOON", label: "오후" },
  { value: "EVENING", label: "저녁" },
  { value: "NIGHT", label: "밤" },
] as const;

export function MyInfoStackPage() {
  const { setHeaderContent } = useStackPage();
  const { data: myProfile } = useMyProfileQuery();
  const updateMutation = useUpdateMyProfileMutation();

  const form = useForm<UpdateMyProfileModel>({
    defaultValues: {
      gender: "MALE",
      birth: "",
      focusTimeZone: "MORNING",
      dayEndTime: "",
      nickname: "",
    },
  });

  const inputClassName =
    "h-12 w-full rounded-xl border px-3 py-2 text-sm bg-neutral-50 placeholder:text-gray-400 border border-transparent focus:outline-none focus:ring-error/20 focus:ring-2 focus:ring-inset not-placeholder-shown:border-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400";

  const selectClassName = `${inputClassName} appearance-none`;

  useEffect(() => {
    setHeaderContent(<span className="text-xl font-semibold text-black">내 정보</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  useEffect(() => {
    if (!myProfile) return;
    form.reset({
      gender: myProfile.gender,
      birth: myProfile.birth,
      focusTimeZone: myProfile.focusTimeZone,
      dayEndTime: myProfile.dayEndTime,
      nickname: myProfile.nickname,
    });
  }, [form, myProfile]);

  const isSaving = updateMutation.isPending || form.formState.isSubmitting;
  const isDirty = form.formState.isDirty;

  const handleSave = form.handleSubmit((values) => updateMutation.mutate(values));

  return (
    <form
      onSubmit={handleSave}
      className="flex h-fit w-full flex-col items-center justify-center px-10 py-[30px]"
    >
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
                <select
                  {...form.register("gender")}
                  className={selectClassName}
                >
                  <option value="MALE">남</option>
                  <option value="FEMALE">여</option>
                </select>
              </FormField>
              <FormField
                label="생년월일"
                className="w-full max-w-[187px]"
                labelClassName="text-base font-semibold text-neutral-900"
              >
                <input
                  type="text"
                  placeholder="YYYY.MM.DD"
                  className={inputClassName}
                  {...form.register("birth")}
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
                  className={inputClassName}
                  {...form.register("nickname")}
                />
              </FormField>
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
              <select
                {...form.register("focusTimeZone")}
                className={selectClassName}
              >
                {focusTimeOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              label="하루 마무리 시간"
              className="flex-col items-start gap-3"
              labelClassName="text-lg font-semibold text-neutral-900"
            >
              <input
                type="time"
                className={inputClassName}
                {...form.register("dayEndTime")}
              />
            </FormField>
          </div>
        </div>
      </div>
      <div className="h-[70px]"></div>
      <FixedActionBar>
        <PrimaryButton
          type="submit"
          className="w-full"
          disabled={isSaving || !isDirty}
        >
          {isSaving ? "저장 중..." : "저장"}
        </PrimaryButton>
      </FixedActionBar>
    </form>
  );
}
