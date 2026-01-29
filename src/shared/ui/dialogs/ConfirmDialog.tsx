"use client";

import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

interface ConfirmDialogProps {
  trigger: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  cancelDisabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  confirmDisabled,
  cancelDisabled,
  open,
  onOpenChange,
  contentClassName,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      modal={false}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "w-[calc(100%-2rem)] sm:max-w-[425px]",
          "data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:slide-out-to-bottom-2",
          contentClassName,
        )}
        overlayClassName="bg-black/40"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <button
              type="button"
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700"
              disabled={cancelDisabled}
            >
              {cancelText}
            </button>
          </DialogClose>
          <button
            type="button"
            className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white"
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
