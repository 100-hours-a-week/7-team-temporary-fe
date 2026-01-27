import type { ReactNode } from "react";

import { IconButton } from "@/shared/ui/button";
import { HeaderFrame } from "@/widgets/app-header";

interface StackHeaderProps {
  title?: string;
  actionLabel?: string | null;
  onActionClick?: () => void;
  headerContent?: ReactNode;
}

export function StackHeader({
  title,
  actionLabel = "뒤로",
  onActionClick,
  headerContent,
}: StackHeaderProps) {
  const centerSlot =
    headerContent ??
    (title ? <span className="text-xl font-semibold text-black">{title}</span> : null);

  return (
    <HeaderFrame
      leftSlot={
        actionLabel ? (
          <IconButton
            icon="prev"
            label={actionLabel}
            onClick={onActionClick}
            className="w-fit p-0 align-middle text-sm text-black"
            iconClassName="h-6 w-6 text-black"
          />
        ) : null
      }
      centerSlot={centerSlot}
      rightSlot={<div className="h-full w-[30px]" />}
    />
  );
}
