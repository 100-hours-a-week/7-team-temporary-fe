"use client";

import type { BaseSyntheticEvent } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import {
  BirthDateInput,
  DayEndTimeInput,
  EmailInput,
  FocusTimeZoneSelect,
  FormField,
  GenderSelect,
  NicknameInput,
  PasswordInput,
  ProfileImageKeyInput,
} from "@/shared/form/ui";

import type { SignUpFormModel } from "../model/types";

interface SignUpFormProps {
  register: UseFormRegister<SignUpFormModel>;
  errors: FieldErrors<SignUpFormModel>;
  nicknameStatus: "idle" | "valid" | "invalid";
  canSubmit: boolean;
  onNicknameCheck: () => void;
  onSubmit: (event?: BaseSyntheticEvent) => void;
  getPresignedUploadUrl?: (file: File) => Promise<string>;
  onPresignedUploadUrlChange?: (url: string | null) => void;
  onFileSelect?: (file: File | null) => void;
  onUploadError?: (error: unknown) => void;
}

export function SignUpForm({
  register,
  errors,
  nicknameStatus,
  canSubmit,
  onNicknameCheck,
  onSubmit,
  getPresignedUploadUrl,
  onPresignedUploadUrlChange,
  onFileSelect,
  onUploadError,
}: SignUpFormProps) {
  const emailError = errors.email?.message?.toString();
  const passwordError = errors.password?.message?.toString();
  const nicknameError = errors.nickname?.message?.toString();
  const genderError = errors.gender?.message?.toString();
  const birthError = errors.birth?.message?.toString();
  const focusTimeZoneError = errors.focusTimeZone?.message?.toString();
  const dayEndTimeError = errors.dayEndTime?.message?.toString();
  const profileImageKeyError = errors.profileImageKey?.message?.toString();

  return (
    <form
      className="flex w-full flex-col gap-4"
      onSubmit={onSubmit}
    >
      <FormField
        label="프로필 선택"
        error={profileImageKeyError}
      >
        <ProfileImageKeyInput
          register={register("profileImageKey")}
          invalid={!!errors.profileImageKey}
          getPresignedUploadUrl={getPresignedUploadUrl}
          onPresignedUploadUrlChange={onPresignedUploadUrlChange}
          onFileSelect={onFileSelect}
          onUploadError={onUploadError}
        />
      </FormField>
      <FormField
        label="이메일"
        error={emailError}
      >
        <EmailInput
          invalid={!!errors.email}
          register={register("email")}
        />
      </FormField>
      <FormField
        label="비밀번호"
        error={passwordError}
      >
        <PasswordInput
          invalid={!!errors.password}
          register={register("password")}
        />
      </FormField>
      <FormField
        label="닉네임"
        error={nicknameError}
      >
        <>
          <div className="flex w-full gap-2">
            <NicknameInput
              invalid={!!errors.nickname}
              register={register("nickname")}
            />
            <button
              className="rounded-xl border px-3 py-2 text-sm whitespace-nowrap"
              type="button"
              onClick={onNicknameCheck}
            >
              중복 확인
            </button>
          </div>
          {nicknameStatus === "valid" && (
            <span className="text-xs text-green-600">사용 가능한 닉네임입니다.</span>
          )}
        </>
      </FormField>
      <FormField
        label="성별"
        error={genderError}
      >
        <GenderSelect
          invalid={!!errors.gender}
          register={register("gender")}
        />
      </FormField>
      <FormField
        label="생년월일"
        error={birthError}
      >
        <BirthDateInput
          invalid={!!errors.birth}
          register={register("birth")}
        />
      </FormField>
      <FormField
        label="집중 시간대"
        error={focusTimeZoneError}
      >
        <FocusTimeZoneSelect
          invalid={!!errors.focusTimeZone}
          register={register("focusTimeZone")}
        />
      </FormField>
      <FormField
        label="하루 종료 시간"
        error={dayEndTimeError}
      >
        <DayEndTimeInput
          invalid={!!errors.dayEndTime}
          register={register("dayEndTime")}
        />
      </FormField>
      <button
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        type="submit"
        disabled={!canSubmit}
      >
        회원가입
      </button>
    </form>
  );
}
