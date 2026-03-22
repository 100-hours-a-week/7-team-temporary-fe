"use client";

import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
import { PrimaryButton } from "@/shared/ui/button/primary";

interface ActionSheetContentProps {
  title?: ReactNode;
  description?: ReactNode;
  info?: ReactNode;
  reserveInfoSpace?: boolean;
  children?: ReactNode;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
  primaryLoading?: boolean;
  primaryLoadingText?: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  infoClassName?: string;
  actionsClassName?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
}

export function ActionSheetContent({
  title,
  description,
  info,
  reserveInfoSpace = false,
  children,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  primaryDisabled,
  secondaryDisabled,
  primaryLoading,
  primaryLoadingText,
  className,
  titleClassName,
  descriptionClassName,
  infoClassName,
  actionsClassName,
  primaryClassName,
  secondaryClassName,
}: ActionSheetContentProps) {
  const shouldRenderInfo = reserveInfoSpace || info !== undefined;
  const shouldRenderDefault = !children && (title || description || shouldRenderInfo);
  return (
    <div className={cn("px-6 pt-6 pb-6 text-center", className)}>
      {children}
      {shouldRenderDefault ? (
        <>
          {title ? (
            <p className={cn("text-lg font-semibold text-neutral-900", titleClassName)}>{title}</p>
          ) : null}
          {description ? (
            <p className={cn("mt-3 text-sm text-neutral-700", descriptionClassName)}>
              {description}
            </p>
          ) : null}
          {shouldRenderInfo ? (
            <p className={cn("mt-2 text-xs text-neutral-400", infoClassName)}>{info ?? ""}</p>
          ) : null}
        </>
      ) : null}
      <div className={cn("mt-6 flex gap-3", actionsClassName)}>
        <PrimaryButton
          className={cn("bg-primary-600 hover:bg-primary-700 w-full text-white", primaryClassName)}
          isLoading={primaryLoading}
          loadingText={primaryLoadingText}
          disabled={primaryDisabled}
          onClick={onPrimary}
        >
          {primaryLabel}
        </PrimaryButton>
        <PrimaryButton
          className={cn(
            "w-full bg-neutral-100 text-neutral-500 hover:bg-neutral-100",
            secondaryClassName,
          )}
          disabled={secondaryDisabled}
          onClick={onSecondary}
        >
          {secondaryLabel}
        </PrimaryButton>
      </div>
    </div>
  );
}
