"use client";

import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

import { BottomSheet } from "./BottomSheet";

interface MoreActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  contentClassName?: string;
  actionsClassName?: string;
  expandHeight?: number;
}

export function MoreActionSheet({
  open,
  onOpenChange,
  children,
  contentClassName,
  actionsClassName,
  expandHeight = 30,
}: MoreActionSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      fitContent
      expandHeight={expandHeight}
    >
      <div className={cn("px-6 pt-5 pb-7", contentClassName)}>
        <div className={cn("flex flex-col gap-3", actionsClassName)}>{children}</div>
      </div>
    </BottomSheet>
  );
}
