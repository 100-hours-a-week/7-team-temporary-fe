"use client";

import type { BaseSyntheticEvent } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { SignUpFormModel } from "../model/types";

interface SignUpFormProps {
  register: UseFormRegister<SignUpFormModel>;
  errors: FieldErrors<SignUpFormModel>;
  nicknameStatus: "idle" | "valid" | "invalid";
  canSubmit: boolean;
  onNicknameCheck: () => void;
  onSubmit: (event?: BaseSyntheticEvent) => void;
}

export function SignUpForm({
  register,
  errors,
  nicknameStatus,
  canSubmit,
  onNicknameCheck,
  onSubmit,
}: SignUpFormProps) {
  const emailError = errors.email?.message;
  const passwordError = errors.password?.message;
  const nicknameError = errors.nickname?.message;
  const genderError = errors.gender?.message;
  const birthError = errors.birth?.message;
  const focusTimeZoneError = errors.focusTimeZone?.message;
  const dayEndTimeError = errors.dayEndTime?.message;
  const profileImageKeyError = errors.profileImageKey?.message;

  return (
    <form
      className="flex w-full flex-col gap-4"
      onSubmit={onSubmit}
    >
      <label className="flex flex-col gap-2 text-sm">
        이메일
        <input
          className="w-full rounded-md border px-3 py-2"
          type="email"
          {...register("email")}
          placeholder="email@email.com"
        />
        {emailError && <span className="text-xs text-red-500">{emailError}</span>}
      </label>
      <label className="flex flex-col gap-2 text-sm">
        비밀번호
        <input
          className="w-full rounded-md border px-3 py-2"
          type="password"
          {...register("password")}
          placeholder="비밀번호"
        />
        {passwordError && <span className="text-xs text-red-500">{passwordError}</span>}
      </label>
      <label className="flex flex-col gap-2 text-sm">
        닉네임
        <div className="flex w-full gap-2">
          <input
            className="w-full rounded-md border px-3 py-2"
            type="text"
            {...register("nickname")}
            placeholder="닉네임"
          />
          <button
            className="rounded-md border px-3 py-2 text-sm whitespace-nowrap"
            type="button"
            onClick={onNicknameCheck}
          >
            중복 확인
          </button>
        </div>
        {nicknameStatus === "valid" && (
          <span className="text-xs text-green-600">사용 가능한 닉네임입니다.</span>
        )}
        {nicknameError && <span className="text-xs text-red-500">{nicknameError}</span>}
      </label>
      <label className="flex flex-col gap-2 text-sm">
        성별
        <select
          className="w-full rounded-md border px-3 py-2"
          {...register("gender")}
        >
          <option value="MALE">남성</option>
          <option value="FEMALE">여성</option>
        </select>
        {genderError && <span className="text-xs text-red-500">{genderError}</span>}
      </label>
      <label className="flex flex-col gap-2 text-sm">
        생년월일
        <input
          className="w-full rounded-md border px-3 py-2"
          type="text"
          {...register("birth")}
          placeholder="YYYY.MM.DD"
        />
        {birthError && <span className="text-xs text-red-500">{birthError}</span>}
      </label>
      <label className="flex flex-col gap-2 text-sm">
        집중 시간대
        <select
          className="w-full rounded-md border px-3 py-2"
          {...register("focusTimeZone")}
        >
          <option value="MORNING">아침</option>
          <option value="AFTERNOON">오후</option>
          <option value="EVENING">저녁</option>
          <option value="NIGHT">밤</option>
        </select>
        {focusTimeZoneError && <span className="text-xs text-red-500">{focusTimeZoneError}</span>}
      </label>
      <label className="flex flex-col gap-2 text-sm">
        하루 종료 시간
        <input
          className="w-full rounded-md border px-3 py-2"
          type="text"
          {...register("dayEndTime")}
          placeholder="HH:MM"
        />
        {dayEndTimeError && <span className="text-xs text-red-500">{dayEndTimeError}</span>}
      </label>
      <label className="flex flex-col gap-2 text-sm">
        프로필 이미지 키 (선택)
        <input
          className="w-full rounded-md border px-3 py-2"
          type="text"
          {...register("profileImageKey")}
          placeholder="profile-image-key"
        />
        {profileImageKeyError && (
          <span className="text-xs text-red-500">{profileImageKeyError}</span>
        )}
      </label>
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
