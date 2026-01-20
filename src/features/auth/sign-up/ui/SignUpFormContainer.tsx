"use client";

import { useSignUpForm } from "../model/useSignUpForm";
import { SignUpForm } from "./SignUpForm";

export function SignUpFormContainer() {
  const { register, errors, nicknameStatus, canSubmit, handleNicknameCheck, handleSubmit } =
    useSignUpForm();

  return (
    <SignUpForm
      register={register}
      errors={errors}
      nicknameStatus={nicknameStatus}
      canSubmit={canSubmit}
      onNicknameCheck={handleNicknameCheck}
      onSubmit={handleSubmit}
    />
  );
}
