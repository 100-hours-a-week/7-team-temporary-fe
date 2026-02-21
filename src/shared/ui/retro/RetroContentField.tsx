"use client";

import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/shared/lib";

interface RetroContentFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  helperText?: string;
  textareaClassName?: string;
}

const BASE_CLASS_NAME =
  "w-full rounded-2xl border border-[#d8d8d8] bg-[#f7f7f7] text-sm text-black placeholder:text-sm px-3 py-2 placeholder:text-[#bdbdbd]";

export function RetroContentField({
  className,
  textareaClassName,
  invalid,
  helperText,
  value,
  defaultValue,
  ...props
}: RetroContentFieldProps) {
  return (
    <div className={cn("w-full", className)}>
      <textarea
        className={cn(
          BASE_CLASS_NAME,
          "h-[178px] resize-none outline-none",
          invalid ? "border-[var(--color-red-400)]" : null,
          textareaClassName,
        )}
        data-invalid={invalid || undefined}
        aria-invalid={invalid || undefined}
        value={value}
        defaultValue={defaultValue}
        {...props}
      />
      {helperText ? (
        <p
          className={cn("mt-1 text-xs", invalid ? "text-[var(--color-red-400)]" : "text-gray-500")}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
