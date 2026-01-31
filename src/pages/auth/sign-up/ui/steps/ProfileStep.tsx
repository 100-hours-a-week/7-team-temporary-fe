"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import type { SignUpFormModel } from "@/features/auth/sign-up/model";
import { useProfileImagePresign } from "@/features/image/model";
import {
  BirthDateInput,
  EmailInput,
  FormField,
  GenderSelect,
  NicknameInput,
  PasswordInput,
  ProfileImageKeyInput,
} from "@/shared/form/ui";
import { apiFetch, Endpoint } from "@/shared/api";
import { useToast } from "@/shared/ui/toast";
import { SplitText } from "@/shared/ui";
import { OnboardingQuestionLayout } from "@/widgets/auth/onboarding/ui";

type EmailCheckStatus = "idle" | "loading" | "success" | "error";

export function ProfileStep() {
  const titleText = "당신을 알고 싶어요. 당신은 어떤 사람인가요?";
  const handleAnimationComplete = () => {};
  const {
    register,
    formState: { errors },
    trigger,
    watch,
    getValues,
    setValue,
  } = useFormContext<SignUpFormModel>();
  const { showToast } = useToast();
  const [emailCheckStatus, setEmailCheckStatus] = useState<EmailCheckStatus>("idle");
  const [emailHelperText, setEmailHelperText] = useState<string | undefined>(undefined);
  const profileImageKeyRegister = register("profileImageKey");
  const { handleFileSelect, previewUrl, imageKey, isUploading } = useProfileImagePresign();
  const emailValue = watch("email");
  const emailError = errors.email?.message?.toString();
  const passwordError = errors.password?.message?.toString();
  const nicknameError = errors.nickname?.message?.toString();
  const genderError = errors.gender?.message?.toString();
  const birthError = errors.birth?.message?.toString();
  const profileImageKeyError = errors.profileImageKey?.message?.toString();
  const handleProfileImageError = (error: unknown) => {
    const message = error instanceof Error ? error.message : "프로필 이미지 업로드에 실패했습니다.";
    showToast(message, "error");
  };

  useEffect(() => {
    setEmailCheckStatus("idle");
    setEmailHelperText(undefined);
  }, [emailValue]);

  useEffect(() => {
    setValue("profileImageKey", imageKey ?? null, {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [imageKey, setValue]);

  const handleEmailCheck = async () => {
    const isValid = await trigger("email");
    if (!isValid) return;
    const email = getValues("email").trim();
    if (!email) return;
    setEmailCheckStatus("loading");
    setEmailHelperText("중복 확인 중...");
    try {
      const result = await apiFetch<{
        isDuplicated?: boolean;
        duplicated?: boolean;
        isAvailable?: boolean;
        available?: boolean;
      }>(Endpoint.USER.CHECK.EMAIL(email));
      const isDuplicated = result?.isDuplicated ?? result?.duplicated ?? false;
      const isAvailable = result?.isAvailable ?? result?.available;
      if (isDuplicated || isAvailable === false) {
        setEmailCheckStatus("error");
        setEmailHelperText("이미 사용 중인 이메일입니다.");
        return;
      }
      setEmailCheckStatus("success");
      setEmailHelperText("사용 가능한 이메일입니다.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "이미 사용 중인 이메일입니다.";
      setEmailCheckStatus("error");
      setEmailHelperText(message);
    }
  };

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
            onUploadError={handleProfileImageError}
            previewUrl={previewUrl}
            isDisabled={isUploading}
          />
        </FormField>
        <FormField
          label="이메일"
          error={emailError}
          helperText={emailHelperText}
        >
          <div className="flex w-full items-center gap-2">
            <EmailInput
              invalid={!!errors.email}
              register={register("email")}
              placeholder="이메일을 입력해주세요."
            />
            <button
              type="button"
              className="h-12 shrink-0 rounded-xl border border-neutral-900 px-3 text-sm font-semibold text-neutral-900 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400"
              onClick={handleEmailCheck}
              disabled={emailCheckStatus === "loading" || !emailValue}
            >
              중복확인
            </button>
          </div>
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
            </div>
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
