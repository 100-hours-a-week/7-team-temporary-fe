import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib";

interface ActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  buttonText: string;
}

export function ActionButton({
  buttonText,
  className,
  type = "button",
  ...props
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "my-[5px] inline-flex items-end justify-center rounded-[90px] border border-[color:var(--color-primary-700)] px-[19px] py-0 text-base font-semibold text-[color:var(--color-primary-700)]",
        className,
      )}
      {...props}
    >
      {buttonText}
    </button>
  );
}
