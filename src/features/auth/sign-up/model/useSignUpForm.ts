"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";

import { normalizeProfileImageKey } from "@/shared/validation";

import { signUpFormSchema } from "./schema";
import type { SignUpFormModel } from "./types";

const DEFAULT_FORM: SignUpFormModel = {
  email: "",
  password: "",
  nickname: "",
  gender: "MALE",
  birth: "",
  focusTimeZone: "MORNING",
  dayEndTime: "",
  profileImageKey: undefined,
};

//타입 : idle 초기 상태, valid 유효, invalid 실패
type NicknameCheckStatus = "idle" | "valid" | "invalid";

//선택(이미지)을 작성했을까요?
interface UseSignUpFormOptions {
  onValid?: (form: SignUpFormModel) => void;
}

//회원가입 폼의 상태를 한 곳에 모아둔 묶음
export const useSignUpForm = (
  options: UseSignUpFormOptions = {},
): UseFormReturn<SignUpFormModel> & {
  nicknameStatus: NicknameCheckStatus;
  canSubmit: boolean;
  handleNicknameCheck: () => Promise<void>;
  submitForm: () => Promise<void>;
} => {
  const [nicknameStatus, setNicknameStatus] = useState<NicknameCheckStatus>("idle");

  const form = useForm<SignUpFormModel>({
    defaultValues: DEFAULT_FORM,
    mode: "onBlur",
    resolver: zodResolver(signUpFormSchema),
  });
  const {
    handleSubmit,
    trigger,
    watch,
    formState: { isValid, isSubmitting },
  } = form;

  const nickname = watch("nickname");

  useEffect(() => {
    setNicknameStatus("idle");
  }, [nickname]);

  const handleNicknameCheck = async () => {
    const isValidNickname = await trigger("nickname");
    setNicknameStatus(isValidNickname ? "valid" : "invalid");
  };

  const canSubmit = isValid && nicknameStatus === "valid" && !isSubmitting;

  //제출 시 이미지 있을 경우 함께 제출
  const onSubmit = handleSubmit((data) => {
    options.onValid?.({
      ...data,
      profileImageKey: normalizeProfileImageKey(data.profileImageKey),
    });
  });

  return {
    ...form,
    nicknameStatus,
    canSubmit,
    handleNicknameCheck,
    submitForm: onSubmit,
  };
};
