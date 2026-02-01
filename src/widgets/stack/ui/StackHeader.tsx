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
    (title ? <span className="text-ink-900 text-xl font-semibold">{title}</span> : null);

  return (
    <HeaderFrame
      leftSlot={
        actionLabel ? (
          <IconButton
            icon="prev"
            label={actionLabel}
            onClick={onActionClick}
            className="text-ink-900 w-fit p-0 align-middle text-sm"
            iconClassName="h-6 w-6 text-ink-900"
          />
        ) : null
      }
      centerSlot={centerSlot}
      rightSlot={<div className="h-full w-[30px]" />}
    />
  );
}
