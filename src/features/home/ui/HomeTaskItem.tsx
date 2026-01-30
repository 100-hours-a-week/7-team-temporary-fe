import styled from "@emotion/styled";
import type { CSSProperties } from "react";

import { cn } from "@/shared/lib";

import { Icon } from "@/shared/ui/icon";

import type { TaskItemModel } from "../model/taskModels";

interface HomeTaskItemProps {
  task: TaskItemModel;
  onToggleComplete: (taskId: number) => void;
  className?: string;
  style?: CSSProperties;
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
export function HomeTaskItem({ task, onToggleComplete, className, style }: HomeTaskItemProps) {
  const timeLabel = TIME_LABEL_BY_TYPE[task.timeType];
  const timeValue = getTimeValue(task);

  return (
    <Card
      className={cn("text-ink-900", className)}
      style={style}
      $isCompleted={task.isCompleted}
      $isFixedTime={task.isFixedTime}
    >
      <Row>
        <CompleteButton
          type="button"
          aria-pressed={task.isCompleted}
          aria-label={task.isCompleted ? "완료됨" : "완료"}
          onClick={() => onToggleComplete(task.taskId)}
        >
          <Icon
            name={task.isCompleted ? "todo_check" : "todo_unchecked"}
            className="h-7 w-7"
            aria-hidden
          />
        </CompleteButton>
        <Content>
          <TitleRow>
            <Title $isCompleted={task.isCompleted}>{task.title}</Title>
            {task.isUrgent ? <UrgentBadge>중요</UrgentBadge> : null}
          </TitleRow>
          <MetaRow>
            <MetaValue>{timeValue}</MetaValue>
          </MetaRow>
        </Content>
      </Row>
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
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  position: relative;
  z-index: 1;
  border-radius: 16px;
  border: 1px solid ${({ $isFixedTime }) => ($isFixedTime ? "#c7d2fe" : "#e5e7eb")};
  background: ${({ $isCompleted }) => ($isCompleted ? "#f3f4f6" : "#ffffff")};
  ${({ $isCompleted }) => ($isCompleted ? "color: #9ca3af;" : "")};
`;

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  line-height: 16px;
  min-width: 0;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Title = styled.div<{ $isCompleted: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ $isCompleted }) => ($isCompleted ? "#9ca3af" : "inherit")};
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
  color: inherit;
  opacity: 0.7;
`;

const MetaLabel = styled.span`
  min-width: 70px;
  font-weight: 600;
  color: inherit;
`;

const MetaValue = styled.span`
  font-weight: 500;
`;

const CompleteButton = styled.button`
  border: none;
  padding: 0;
  border-radius: 8px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
`;
