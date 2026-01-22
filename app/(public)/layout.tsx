"use client";

import type { ReactNode } from "react";

import { StackPageRoot, StackPageScope } from "@/shared/ui";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <StackPageRoot>
      <StackPageScope
        as="main"
        className="flex min-h-screen w-full flex-col items-center px-10 py-10 text-left"
      >
        {children}
      </StackPageScope>
    </StackPageRoot>
  );
}
