import Link from "next/link";

import { AUTH_LOGIN_PATH } from "@/shared/auth";
import { cn } from "@/shared/lib";
import { Icon } from "@/shared/ui/icon";

interface PublicPageHeaderProps {
  title: string;
  className?: string;
}

export function PublicPageHeader({ title, className }: PublicPageHeaderProps) {
  return (
    <header
      className={cn(
        "grid h-[52px] w-full grid-cols-[auto_1fr_auto] items-center px-7 py-3",
        className,
      )}
    >
      <span className="text-ink-800 text-xl font-bold">{title}</span>
      <div />
      <Link
        href={AUTH_LOGIN_PATH}
        aria-label="로그인 페이지로 이동"
        className="justify-self-end rounded-sm focus-visible:ring-2 focus-visible:ring-[#391616]/30 focus-visible:outline-none"
      >
        <Icon
          name="logoDefault"
          className="h-7 w-auto"
          aria-hidden
        />
      </Link>
    </header>
  );
}
