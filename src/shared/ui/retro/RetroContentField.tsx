"use client";

import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/shared/lib";

type RetroContentFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const BASE_CLASS_NAME =
  "w-full rounded-2xl border border-[#d8d8d8] bg-[#f7f7f7] text-sm text-black placeholder:text-sm px-3 py-2 placeholder:text-[#bdbdbd]";

export function RetroContentField({
  className,
  value,
  defaultValue,
  ...props
}: RetroContentFieldProps) {
  return (
    <textarea
      className={cn(BASE_CLASS_NAME, "h-[178px] resize-none outline-none", className)}
      value={value}
      defaultValue={defaultValue}
      {...props}
    />
  );
}
