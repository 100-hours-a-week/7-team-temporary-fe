import styled from "@emotion/styled";
import type { ExcludedTaskItemModel } from "../model/taskModels";

type ExcludedTaskItemVariant = "DEFAULT" | "PENDING_SWAP" | "TIME_CONFLICT";

interface ExcludedTaskItemProps {
  task: ExcludedTaskItemModel;
  onRestore: (scheduleId: number) => void;
  variant?: ExcludedTaskItemVariant;
}

/**
 * 제외된 작업 목록에 표시되는 아이템.
 */
export function ExcludedTaskItem({ task, onRestore, variant = "DEFAULT" }: ExcludedTaskItemProps) {
  return (
    <Card $variant={variant}>
      <Title>{task.title}</Title>
      <ActionRow>
        <ActionButton
          type="button"
          onClick={() => onRestore(task.scheduleId)}
        >
          복원
        </ActionButton>
      </ActionRow>
    </Card>
  );
}

const Card = styled.article<{ $variant: ExcludedTaskItemVariant }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 16px;
  vertical-align: middle;
  border-radius: 16px;
  border: 1px solid ${({ $variant }) => ($variant === "TIME_CONFLICT" ? "#fecaca" : "#e5e7eb")};
  background: ${({ $variant }) => ($variant === "PENDING_SWAP" ? "#f9fafb" : "#ffffff")};
`;

const Title = styled.div`
  vertical-align: middle;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  background: #111827;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;
