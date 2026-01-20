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
  focuseTimeZone: "MORNING",
  dayEndTime: "",
  profileImageKey: undefined,
};

const REQUIRED_FIELDS: Array<keyof SignUpFormModel> = [
  "email",
  "password",
  "nickname",
  "gender",
  "birth",
  "focuseTimeZone",
  "dayEndTime",
];

type NicknameCheckStatus = "idle" | "valid" | "invalid";

interface UseSignUpFormOptions {
  onValid?: (form: SignUpFormModel) => void;
}

export const useSignUpForm = (options: UseSignUpFormOptions = {}) => {
  const [nicknameStatus, setNicknameStatus] = useState<NicknameCheckStatus>("idle");

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, touchedFields },
  } = useForm<SignUpFormModel>({
    defaultValues: DEFAULT_FORM,
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: zodResolver(signUpFormSchema),
  });

  const nicknameValue = watch("nickname");

  useEffect(() => {
    setNicknameStatus("idle");
  }, [nicknameValue]);

  const handleNicknameCheck = async () => {
    const isValid = await trigger("nickname");
    setNicknameStatus(isValid ? "valid" : "invalid");
  };

  const values = watch();
  const hasAllRequiredValues = REQUIRED_FIELDS.every((key) => {
    const value = values[key];
    if (typeof value === "string") {
      return value.trim().length > 0;
    }
    return value !== undefined && value !== null;
  });

  const hasAllRequiredTouched = REQUIRED_FIELDS.every((key) => !!touchedFields[key]);
  const hasNoErrors = Object.keys(errors).length === 0;
  const canSubmit =
    hasAllRequiredValues && hasAllRequiredTouched && hasNoErrors && nicknameStatus === "valid";

  const onSubmit = handleSubmit((data: SignUpFormModel) => {
    const normalizedForm: SignUpFormModel = {
      ...data,
      profileImageKey: normalizeProfileImageKey(data.profileImageKey),
    };
    options.onValid?.(normalizedForm);
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
