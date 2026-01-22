"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { FormProvider } from "react-hook-form";
import { useSignUpForm } from "../../model";

type SignUpFormContextValue = ReturnType<typeof useSignUpForm>;

const SignUpFormContext = createContext<SignUpFormContextValue | null>(null);

interface SignUpFormContainerProps {
  children: ReactNode;
}

export function SignUpFormContainer({ children }: SignUpFormContainerProps) {
  const form = useSignUpForm();

  return (
    <SignUpFormContext.Provider value={form}>
      <FormProvider {...form}>{children}</FormProvider>
    </SignUpFormContext.Provider>
  );
}

export function useSignUpFormContext() {
  const context = useContext(SignUpFormContext);
  if (!context) {
    throw new Error("useSignUpFormContext는 SignUpFormContainer 내부에서만 사용해야 합니다.");
  }
  return context;
}
