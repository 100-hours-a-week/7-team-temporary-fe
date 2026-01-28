import { cn } from "@/shared/lib";

interface ActionButtonProps {
  buttonText: string;
  onClick: () => void;
  className?: string;
}

export function ActionButton({ buttonText, onClick, className }: ActionButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "my-[5px] inline-flex items-end justify-center rounded-[90px] border border-[color:var(--color-primary-700)] px-[19px] py-0 text-base font-semibold text-[color:var(--color-primary-700)]",
        className,
      )}
      onClick={onClick}
    >
      {buttonText}
    </button>
  );
}
