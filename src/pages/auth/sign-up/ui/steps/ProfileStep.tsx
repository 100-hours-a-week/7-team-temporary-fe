"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import type { SignUpFormModel } from "@/features/auth/sign-up/model";
import { useProfileImagePresign } from "@/features/image/model";
import { useSignUpFormContext } from "@/pages/auth/sign-up/ui/SignUpFormContainer";
import {
  BirthDateInput,
  EmailInput,
  FormField,
  GenderSelect,
  NicknameInput,
  PasswordInput,
  ProfileImageKeyInput,
} from "@/shared/form/ui";
import { SplitText } from "@/shared/ui";
import { OnboardingQuestionLayout } from "@/widgets/auth/onboarding/ui";

export function ProfileStep() {
  const titleText = "당신을 알고 싶어요. 당신은 어떤 사람인가요?";
  const handleAnimationComplete = () => {};
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext<SignUpFormModel>();
  const profileImageKeyRegister = register("profileImageKey");
  const { nicknameStatus, handleNicknameCheck } = useSignUpFormContext();
  const { handleFileSelect, previewUrl, imageKey, isUploading } = useProfileImagePresign();
  const emailError = errors.email?.message?.toString();
  const passwordError = errors.password?.message?.toString();
  const nicknameError = errors.nickname?.message?.toString();
  const genderError = errors.gender?.message?.toString();
  const birthError = errors.birth?.message?.toString();
  const profileImageKeyError = errors.profileImageKey?.message?.toString();

  useEffect(() => {
    setValue("profileImageKey", imageKey ?? null, {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [imageKey, setValue]);

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
      description="가입을 위해 개인정보를 입력해주세요."
    >
      <div className="flex flex-col gap-4">
        <FormField
          label="프로필 이미지 (선택)"
          error={profileImageKeyError}
          className="items-center"
          contentClassName="flex items-center justify-center text-center"
        >
          <ProfileImageKeyInput
            register={profileImageKeyRegister}
            invalid={!!errors.profileImageKey}
            onFileSelect={handleFileSelect}
            previewUrl={previewUrl}
            isDisabled={isUploading}
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
        <div className="flex h-20"></div>
      </div>
    </OnboardingQuestionLayout>
  );
}
