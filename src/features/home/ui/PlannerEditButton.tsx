import { HomeActionButton } from "./HomeActionButton";

interface PlannerEditButtonProps {
  onClick: () => void;
}

export function PlannerEditButton({ onClick }: PlannerEditButtonProps) {
  return (
    <HomeActionButton
      buttonText="플래너 수정"
      onClick={onClick}
    />
  );
}
