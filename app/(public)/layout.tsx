"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib";
import { StackPageRoot, StackPageScope } from "@/widgets/stack";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const isRetroPublicRoute = pathname === "/retro/public";

  return (
    <StackPageRoot>
      <StackPageScope
        as="main"
        className={cn(
          "flex h-dvh w-full flex-col items-center overflow-hidden text-left",
          isRetroPublicRoute ? "px-0 py-0" : "px-10 py-10",
        )}
        pageClassName={cn("bg-white", isRetroPublicRoute && "h-full !py-0")}
        overlayClassName="bg-white"
      >
        {children}
      </StackPageScope>
    </StackPageRoot>
  );
}
