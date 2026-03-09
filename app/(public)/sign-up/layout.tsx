import type { ReactNode } from "react";

import { StackPageRoot, StackPageScope } from "@/widgets/stack";

interface SignUpLayoutProps {
  children: ReactNode;
}

export default function SignUpLayout({ children }: SignUpLayoutProps) {
  return (
    <StackPageRoot>
      <StackPageScope
        as="main"
        className="flex h-dvh w-full flex-col items-center overflow-hidden px-10 py-10 text-left"
        pageClassName="bg-white"
        overlayClassName="bg-white"
      >
        {children}
      </StackPageScope>
    </StackPageRoot>
  );
}
