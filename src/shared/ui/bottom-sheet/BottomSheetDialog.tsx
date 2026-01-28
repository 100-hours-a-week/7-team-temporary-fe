"use client";

import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

interface BottomSheetDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  headerClassName?: string;
}

export function BottomSheetDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  contentClassName,
  headerClassName,
}: BottomSheetDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        className={cn(
          "top-auto bottom-0 left-0 grid w-full max-w-none translate-x-0 translate-y-0",
          "rounded-t-2xl rounded-b-none border bg-white p-6",
          "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
          contentClassName,
        )}
      >
        {title || description ? (
          <DialogHeader className={headerClassName}>
            {title ? <DialogTitle>{title}</DialogTitle> : null}
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
        ) : null}
        {children}
      </DialogContent>
    </Dialog>
  );
}
