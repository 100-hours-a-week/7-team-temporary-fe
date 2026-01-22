import type { ReactNode } from "react";

import { IconButton } from "@/shared/ui/button";

interface AppHeaderProps {
  title?: string;
  actionLabel?: string | null;
  onActionClick?: () => void;
  headerContent?: ReactNode;
}

export function AppHeader({
  actionLabel = "Action",
  onActionClick,
  headerContent,
}: AppHeaderProps) {
  return (
    <header className="grid h-[52px] w-full grid-cols-3 grid-cols-[auto_1fr_auto] items-center gap-x-6 px-4 py-3">
      <div className="justify-self-start">
        {actionLabel && (
          <IconButton
            icon="prev"
            label={actionLabel}
            onClick={onActionClick}
            className="w-fit p-0 align-middle text-sm text-black"
          />
        )}
      </div>
      <div className="w-full justify-self-center align-middle">
        {headerContent ? <div className="flex w-full items-center">{headerContent}</div> : null}
      </div>
      <div className="h-full w-[30px]" />
    </header>
  );
}
