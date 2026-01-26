"use client";

import type { ReactNode } from "react";

import { createContext, useContext, useEffect } from "react";

import { FormProvider } from "react-hook-form";

import { useSignUpForm, useSignUpMutation } from "@/features/auth/sign-up/model";
import { useMutationErrorEffect } from "@/shared/query";
import { useSignUpErrorEffect } from "@/pages/auth/sign-up/ui/useSignUpErrorEffect";

type SignUpFormContextValue = ReturnType<typeof useSignUpForm>;
// useSignUpForm 훅이 반환하는 객체의 타입을 Context 값 타입으로 정의

const SignUpFormContext = createContext<SignUpFormContextValue | null>(null);
// 회원가입 폼 상태를 담을 Context 생성 (초기값은 null)

interface SignUpFormContainerProps {
  children: ReactNode;
}

export function SignUpFormContainer({ children }: SignUpFormContainerProps) {
  const mutation = useSignUpMutation();

  const form = useSignUpForm({
    //useSignUpMutation이 만들어 둔 mutation을 호출하면서 현재 폼 formData를 넘겨서 api 요청
    onValid: (formData) => {
      mutation.mutate(formData);
    },
  });

  useSignUpErrorEffect(mutation, form);
  useMutationErrorEffect(mutation);

  useEffect(() => {
    const subscription = form.watch((value, info) => {
      console.log("[SignUpForm] change", { name: info.name, type: info.type, value });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <SignUpFormContext.Provider value={form}>
      <FormProvider {...form}>{children}</FormProvider>
    </SignUpFormContext.Provider>
  );
}

// SignUpFormContext를 안전하게 사용하기 위한 커스텀 훅
export function useSignUpFormContext() {
  const context = useContext(SignUpFormContext);

  if (!context) {
    throw new Error("useSignUpFormContext는 SignUpFormContainer 내부에서만 사용해야 합니다.");
  }

  return context;
  // 정상적인 경우 회원가입 폼 상태 반환
}
