import styled from "@emotion/styled";

import type { EditableTaskItemModel } from "../model/taskModels";

interface EditableTaskItemProps {
  task: EditableTaskItemModel;
  isLocked: boolean;
  onUpdate: (payload: { scheduleId: number; startAt: string; endAt: string }) => void;
  onDelete: (scheduleId: number) => void;
  onExclude: (scheduleId: number) => void;
}

const EMPTY_TIME_TEXT = "시간 정보 없음";

/**
 * 플래너 수정 페이지에서 일정 편집을 위한 단일 작업 아이템.
 */
export function EditableTaskItem({
  task,
  isLocked,
  onUpdate,
  onDelete,
  onExclude,
}: EditableTaskItemProps) {
  const isAiAssigned = task.assignedBy === "AI";
  const timeLabel = getTimeLabel(task);
  const timeValue = formatTimeRange(task.startAt, task.endAt);

  return (
    <Card $isLocked={isLocked}>
      <HeaderRow>
        <Handle />
        <TitleRow>
          <Title>{task.title}</Title>
          <AssignmentBadge $isAi={isAiAssigned}>
            {isAiAssigned ? "AI 배치" : "사용자 배치"}
          </AssignmentBadge>
          {task.isUrgent ? <UrgentBadge>긴급</UrgentBadge> : null}
        </TitleRow>
      </HeaderRow>
      <MetaRow>
        <MetaLabel>{timeLabel}</MetaLabel>
        <MetaValue>{timeValue}</MetaValue>
      </MetaRow>
      <ActionRow>
        <ActionButton
          type="button"
          disabled={isLocked}
          onClick={() =>
            onUpdate({ scheduleId: task.scheduleId, startAt: task.startAt, endAt: task.endAt })
          }
        >
          수정
        </ActionButton>
        <ActionButton
          type="button"
          disabled={isLocked}
          onClick={() => onDelete(task.scheduleId)}
        >
          삭제
        </ActionButton>
        <ActionButton
          type="button"
          disabled={isLocked}
          onClick={() => onExclude(task.scheduleId)}
        >
          제외
        </ActionButton>
      </ActionRow>
      {isLocked ? <LockNotice>현재 시간 이전 일정은 수정할 수 없습니다.</LockNotice> : null}
      {isAiAssigned ? <AiNotice>AI 배정 작업은 일부 항목 수정이 제한됩니다.</AiNotice> : null}
    </Card>
  );
}

function getTimeLabel(task: EditableTaskItemModel) {
  if (task.type === "FIXED") return "고정 시간";
  if (task.assignedBy === "AI") return "배치 시간";
  return "예상 소요시간";
}

function formatTimeRange(startAt: string, endAt: string) {
  if (!startAt || !endAt) return EMPTY_TIME_TEXT;
  return `${startAt} ~ ${endAt}`;
}

const Card = styled.article<{ $isLocked: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: ${({ $isLocked }) => ($isLocked ? "#f9fafb" : "#ffffff")};
  opacity: ${({ $isLocked }) => ($isLocked ? 0.7 : 1)};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const Handle = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: repeating-linear-gradient(
    to bottom,
    #d1d5db 0,
    #d1d5db 2px,
    transparent 2px,
    transparent 4px
  );
`;

const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const AssignmentBadge = styled.span<{ $isAi: boolean }>`
  padding: 2px 8px;
  border-radius: 999px;
  background: ${({ $isAi }) => ($isAi ? "#eef2ff" : "#f3f4f6")};
  color: ${({ $isAi }) => ($isAi ? "#4338ca" : "#4b5563")};
  font-size: 12px;
  font-weight: 600;
`;

const UrgentBadge = styled.span`
  padding: 2px 6px;
  border-radius: 999px;
  background: #fee2e2;
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
`;

const MetaLabel = styled.span`
  min-width: 70px;
  font-weight: 600;
  color: #374151;
`;

const MetaValue = styled.span`
  font-weight: 500;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 8px;
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

  &:disabled {
    background: #d1d5db;
    color: #6b7280;
    cursor: not-allowed;
  }
`;

const LockNotice = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;

const AiNotice = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;
