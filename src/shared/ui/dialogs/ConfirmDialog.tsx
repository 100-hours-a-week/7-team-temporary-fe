"use client";

import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { PrimaryButton } from "@/shared/ui/button";

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
  overlayClassName?: string;
  showOverlay?: boolean;
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
  overlayClassName,
  showOverlay = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "w-[calc(100%-2rem)] sm:max-w-[425px]",
          "data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:slide-out-to-bottom-2",
          "bg-white p-0 text-center",
          "rounded-3xl sm:rounded-3xl [&>button]:hidden",
          contentClassName,
        )}
        overlayClassName={cn("bg-black/40", overlayClassName)}
        showOverlay={showOverlay}
      >
        <div className="px-6 pt-6 pb-6">
          <DialogTitle className="text-lg font-semibold text-neutral-900">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="mt-3 text-sm text-neutral-700">
              {description}
            </DialogDescription>
          ) : null}
          <div className="mt-6 flex gap-3">
            <DialogClose asChild>
              <PrimaryButton
                className="w-full bg-neutral-100 text-neutral-500 hover:bg-neutral-100"
                disabled={cancelDisabled}
              >
                {cancelText}
              </PrimaryButton>
            </DialogClose>
            <PrimaryButton
              className="bg-primary-700 hover:bg-primary-700 w-full text-white"
              onClick={onConfirm}
              disabled={confirmDisabled}
            >
              {confirmText}
            </PrimaryButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
