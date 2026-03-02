import styled from "@emotion/styled";
import { formatHHmmRange } from "@/shared/lib";
import type { ExcludedTaskItemModel } from "../model/taskModels";

type ExcludedTaskItemVariant = "DEFAULT" | "PENDING_SWAP" | "TIME_CONFLICT";

interface ExcludedTaskItemProps {
  task: ExcludedTaskItemModel;
  onRestore: (scheduleId: number) => void;
  variant?: ExcludedTaskItemVariant;
}

const EMPTY_TIME_TEXT = "시간 정보 없음";

/**
 * 제외된 작업 목록에 표시되는 아이템.
 */
export function ExcludedTaskItem({ task, onRestore, variant = "DEFAULT" }: ExcludedTaskItemProps) {
  const badge = getBadgeLabel(task.assignmentStatus, variant);
  const timeValue = formatHHmmRange(task.startAt, task.endAt, EMPTY_TIME_TEXT);

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

function getBadgeLabel(
  assignmentStatus: ExcludedTaskItemModel["assignmentStatus"],
  variant: ExcludedTaskItemVariant,
) {
  if (variant === "PENDING_SWAP") return "교체 대기";
  if (variant === "TIME_CONFLICT") return "교체 불가";
  return assignmentStatus === "ASSIGNED" ? "배치됨" : "제외됨";
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

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const Title = styled.div`
  vertical-align: middle;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const StatusBadge = styled.span<{ $variant: ExcludedTaskItemVariant }>`
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $variant }) => {
    if ($variant === "PENDING_SWAP") return "#e0e7ff";
    if ($variant === "TIME_CONFLICT") return "#fee2e2";
    return "#f3f4f6";
  }};
  color: ${({ $variant }) => {
    if ($variant === "PENDING_SWAP") return "#4338ca";
    if ($variant === "TIME_CONFLICT") return "#dc2626";
    return "#4b5563";
  }};
`;

const MetaRow = styled.div`
  display: flex;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
`;

const MetaLabel = styled.span`
  min-width: 40px;
  font-weight: 600;
  color: #374151;
`;

const MetaValue = styled.span`
  font-weight: 500;
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
