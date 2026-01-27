import { HomeActionButton } from "./HomeActionButton";

interface TaskBasketButtonProps {
  onClick: () => void;
}

export function TaskBasketButton({ onClick }: TaskBasketButtonProps) {
  return (
    <HomeActionButton
      buttonText="작업 바구니"
      onClick={onClick}
    />
  );
}
