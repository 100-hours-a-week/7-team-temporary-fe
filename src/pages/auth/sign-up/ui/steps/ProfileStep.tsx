"use client";

import { useFormContext } from "react-hook-form";

import type { SignUpFormModel } from "@/features/auth/sign-up/model";
import { useProfileImagePresign } from "@/features/auth/sign-up/model";
import { useSignUpFormContext } from "@/features/auth/sign-up/ui";
import {
  BirthDateInput,
  EmailInput,
  FormField,
  GenderSelect,
  NicknameInput,
  PasswordInput,
  ProfileImageKeyInput,
} from "@/shared/form/ui";
import { OnboardingQuestionLayout } from "@/widgets/auth/onboarding/ui";

export function ProfileStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SignUpFormModel>();
  const { nicknameStatus, handleNicknameCheck } = useSignUpFormContext();
  const {
    getPresignedUploadUrl,
    handlePresignedUploadUrlChange,
    handleFileSelect,
    handleUploadError,
  } = useProfileImagePresign();
  const emailError = errors.email?.message?.toString();
  const passwordError = errors.password?.message?.toString();
  const nicknameError = errors.nickname?.message?.toString();
  const genderError = errors.gender?.message?.toString();
  const birthError = errors.birth?.message?.toString();
  const profileImageKeyError = errors.profileImageKey?.message?.toString();

  return (
    <OnboardingQuestionLayout
      title={
        <>
          <span>당신을 알고 싶어요.</span>
          <br />
          <span>당신은 어떤 사람인가요?</span>
        </>
      }
      description=""
    >
      <div className="flex flex-col gap-4">
        <FormField
          label="프로필 선택"
          error={profileImageKeyError}
          className="items-center"
        >
          <ProfileImageKeyInput
            register={register("profileImageKey")}
            invalid={!!errors.profileImageKey}
            getPresignedUploadUrl={getPresignedUploadUrl}
            onPresignedUploadUrlChange={handlePresignedUploadUrlChange}
            onFileSelect={handleFileSelect}
            onUploadError={handleUploadError}
          />
        </FormField>
        <FormField
          label="이메일"
          error={emailError}
        >
          <EmailInput
            invalid={!!errors.email}
            register={register("email")}
            placeholder="이메일을 입력해주세요."
          />
        </FormField>
        <FormField
          label="비밀번호"
          error={passwordError}
        >
          <PasswordInput
            invalid={!!errors.password}
            register={register("password")}
            placeholder="비밀번호를 입력해주세요."
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
                placeholder="닉네임을 입력해주세요."
              />
              <button
                className="rounded-xl border px-3 py-2 text-sm whitespace-nowrap"
                type="button"
                onClick={handleNicknameCheck}
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
      </div>
    </OnboardingQuestionLayout>
  );
}
