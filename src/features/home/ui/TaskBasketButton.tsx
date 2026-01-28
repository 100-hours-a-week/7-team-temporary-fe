import { ActionButton } from "@/shared/ui/button";

interface TaskBasketButtonProps {
  onClick: () => void;
}

export function TaskBasketButton({ onClick }: TaskBasketButtonProps) {
  return (
    <ActionButton
      buttonText="작업 바구니"
      onClick={onClick}
    />
  );
}
