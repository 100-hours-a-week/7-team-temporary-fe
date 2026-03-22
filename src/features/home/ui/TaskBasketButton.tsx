import { ActionButton } from "@/shared/ui/button/action";

interface TaskBasketButtonProps {
  onClick: () => void;
}

export function TaskBasketButton({ onClick }: TaskBasketButtonProps) {
  return (
    <ActionButton
      buttonText="작업 리스트"
      onClick={onClick}
      className="my-0 items-center px-4 py-2 text-sm"
    />
  );
}
