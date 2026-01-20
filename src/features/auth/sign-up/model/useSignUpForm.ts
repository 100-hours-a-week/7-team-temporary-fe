"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
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

const REQUIRED_FIELDS: Array<keyof SignUpFormModel> = [
  "email",
  "password",
  "nickname",
  "gender",
  "birth",
  "focusTimeZone",
  "dayEndTime",
];

//타입 : idle 초기 상태, valid 유효, invalid 실패
type NicknameCheckStatus = "idle" | "valid" | "invalid";

//선택(이미지)을 작성했을까요?
interface UseSignUpFormOptions {
  onValid?: (form: SignUpFormModel) => void;
}

//회원가입 폼의 상태를 한 곳에 모아둔 묶음
export const useSignUpForm = (options: UseSignUpFormOptions = {}) => {
  const [nicknameStatus, setNicknameStatus] = useState<NicknameCheckStatus>("idle");

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: {
      errors, //error반환
      isValid, //값이 모두 맞는지
      isSubmitting, //제출 진행 중
    },
  } = useForm<SignUpFormModel>({
    defaultValues: DEFAULT_FORM,
    mode: "onBlur",
    resolver: zodResolver(signUpFormSchema),
  });

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
    register,
    errors,
    nicknameStatus,
    canSubmit,
    handleNicknameCheck,
    handleSubmit: onSubmit,
  };
};
