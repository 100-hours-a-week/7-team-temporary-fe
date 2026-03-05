"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/shared/lib/utils";
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
  showOverlay = true,
}: ConfirmDialogProps) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const resolvedOpen = isControlled ? open : internalOpen;

  const setResolvedOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  useEffect(() => {
    if (!resolvedOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (cancelDisabled) return;
      setResolvedOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [cancelDisabled, resolvedOpen, setResolvedOpen]);

  const handleTriggerClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if ((event.currentTarget as HTMLButtonElement).disabled) return;
      setResolvedOpen(true);
    },
    [setResolvedOpen],
  );

  const triggerElement = isValidElement<{
    onClick?: (event: MouseEvent<HTMLElement>) => void;
  }>(trigger)
    ? cloneElement(trigger, {
        onClick: (event: MouseEvent<HTMLElement>) => {
          trigger.props.onClick?.(event);
          if (event.defaultPrevented) return;
          handleTriggerClick(event);
        },
      })
    : trigger;

  const close = () => {
    if (cancelDisabled) return;
    setResolvedOpen(false);
  };

  return (
    <>
      {triggerElement}
      {resolvedOpen && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
              {showOverlay ? (
                <div
                  className={cn("absolute inset-0 bg-black/40", overlayClassName)}
                  onClick={close}
                />
              ) : null}
              <section
                className={cn(
                  "relative z-10 w-full max-w-[300px] rounded-3xl bg-white px-6 pb-6 text-center",
                  contentClassName,
                )}
              >
                <div className="my-13">
                  <h2 className="text-md mx-auto inline-block max-w-[260px] font-semibold break-keep text-neutral-900">
                    {title}
                  </h2>
                  {description ? (
                    <div className="mx-auto mt-1 max-w-[220px] text-sm text-neutral-700">
                      {description}
                    </div>
                  ) : null}
                </div>
                <div className="mt-6 flex gap-3">
                  <PrimaryButton
                    className="w-full bg-neutral-100 text-neutral-500 hover:bg-neutral-100"
                    disabled={cancelDisabled}
                    onClick={close}
                  >
                    {cancelText}
                  </PrimaryButton>
                  <PrimaryButton
                    className="bg-primary-700 hover:bg-primary-700 w-full text-white"
                    onClick={onConfirm}
                    disabled={confirmDisabled}
                  >
                    {confirmText}
                  </PrimaryButton>
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
