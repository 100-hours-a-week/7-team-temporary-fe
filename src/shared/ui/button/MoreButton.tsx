import type { ButtonHTMLAttributes } from "react";

import { IconButton } from "./IconButton";

interface MoreButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  label?: string;
}

export function MoreButton({ label = "더보기", className, ...props }: MoreButtonProps) {
  return (
    <IconButton
      icon="more"
      label={label}
      className={className ?? "h-10 w-10"}
      iconClassName="h-7 w-7"
      {...props}
    />
  );
}
