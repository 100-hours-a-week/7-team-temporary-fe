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
  gender: "",
  birth: "",
  focusTimeZone: "",
  dayEndTime: "",
  profileImageKey: undefined,
  terms: [],
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

  //##### 닉네임 검사 전에는 nicknameStatus가 'idle' 상태 -> 닉네임 검사 시 'valid' or 'invalid' 상태로 변경 #####//
  const nickname = watch("nickname"); //닉네임 중복검사를 위해 닉네임 값 감시

  useEffect(() => {
    setNicknameStatus("idle");
  }, [nickname]); //닉네임 값이 변경될 때마다 nicknameStatus를 'idle'로 초기화

  const handleNicknameCheck = async () => {
    const isValidNickname = await trigger("nickname");
    setNicknameStatus(isValidNickname ? "valid" : "invalid"); //검사 결과에 따라 상태 변경
  };

  const canSubmit = isValid && !isSubmitting;
  //const canSubmit = isValid && nicknameStatus === "valid" && !isSubmitting;

  //handleSubmit은 form 유효성 검사를 통과했을때, 기본적으로 onValid 콜백을 실행
  //nomalizeProfileImageKey로 프로필 이미지 키를 정규화
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
