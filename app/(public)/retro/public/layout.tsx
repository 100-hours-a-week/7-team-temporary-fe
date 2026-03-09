import type { ReactNode } from "react";

import { StackPageRoot, StackPageScope } from "@/widgets/stack";

interface RetroPublicLayoutProps {
  children: ReactNode;
}

export default function RetroPublicLayout({ children }: RetroPublicLayoutProps) {
  return (
    <StackPageRoot>
      <StackPageScope
        as="main"
        className="flex h-dvh w-full flex-col items-center overflow-hidden px-0 py-0 text-left"
        pageClassName="bg-white h-full !py-0"
        overlayClassName="bg-white"
      >
        {children}
      </StackPageScope>
    </StackPageRoot>
  );
}
