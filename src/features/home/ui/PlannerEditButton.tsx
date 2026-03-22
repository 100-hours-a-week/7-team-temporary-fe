import { ActionButton } from "@/shared/ui/button/action";

interface PlannerEditButtonProps {
  onClick: () => void;
}

export function PlannerEditButton({ onClick }: PlannerEditButtonProps) {
  return (
    <ActionButton
      buttonText="플래너 수정"
      onClick={onClick}
    />
  );
}
