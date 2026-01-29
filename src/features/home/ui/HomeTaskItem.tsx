import styled from "@emotion/styled";

import type { TaskItemModel } from "../model/taskModels";

interface HomeTaskItemProps {
  task: TaskItemModel;
  onToggleComplete: (taskId: number) => void;
}

const TIME_LABEL_BY_TYPE: Record<TaskItemModel["timeType"], string> = {
  ESTIMATED: "예상 소요시간",
  ARRANGED: "배치 시간",
  FIXED: "고정 시간",
};

const EMPTY_TIME_TEXT = "시간 정보 없음";

/**
 * 홈 플래너에서 작업을 표현하는 카드 컴포넌트.
 */
export function HomeTaskItem({ task, onToggleComplete }: HomeTaskItemProps) {
  const timeLabel = TIME_LABEL_BY_TYPE[task.timeType];
  const timeValue = getTimeValue(task);

  return (
    <Card
      $isCompleted={task.isCompleted}
      $isFixedTime={task.isFixedTime}
    >
      <TitleRow>
        <Title $isCompleted={task.isCompleted}>{task.title}</Title>
        {task.isUrgent ? <UrgentBadge>긴급</UrgentBadge> : null}
      </TitleRow>
      <MetaRow>
        <MetaLabel>{timeLabel}</MetaLabel>
        <MetaValue>{timeValue}</MetaValue>
      </MetaRow>
      <ActionRow>
        <CompleteButton
          type="button"
          aria-pressed={task.isCompleted}
          onClick={() => onToggleComplete(task.taskId)}
        >
          {task.isCompleted ? "완료됨" : "완료"}
        </CompleteButton>
      </ActionRow>
    </Card>
  );
}

function getTimeValue(task: TaskItemModel) {
  if (task.timeType === "ESTIMATED") {
    return task.estimatedTimeRange ?? EMPTY_TIME_TEXT;
  }

  if (!task.startTime || !task.endTime) return EMPTY_TIME_TEXT;
  return `${task.startTime} ~ ${task.endTime}`;
}

const Card = styled.article<{ $isCompleted: boolean; $isFixedTime: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid ${({ $isFixedTime }) => ($isFixedTime ? "#c7d2fe" : "#e5e7eb")};
  background: ${({ $isCompleted }) => ($isCompleted ? "#f3f4f6" : "#ffffff")};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Title = styled.div<{ $isCompleted: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ $isCompleted }) => ($isCompleted ? "#9ca3af" : "#111827")};
  text-decoration: ${({ $isCompleted }) => ($isCompleted ? "line-through" : "none")};
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
  justify-content: flex-end;
`;

const CompleteButton = styled.button`
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  background: #111827;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  &[aria-pressed="true"] {
    background: #9ca3af;
  }
`;
