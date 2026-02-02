import styled from "@emotion/styled";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { css, keyframes } from "@emotion/react";

import { cn } from "@/shared/lib";

import { Icon } from "@/shared/ui/icon";

import type { TaskItemModel } from "../model/taskModels";

interface HomeTaskItemProps {
  task: TaskItemModel;
  onToggleComplete: (taskId: number) => void;
  className?: string;
  style?: CSSProperties;
  variant?: "card" | "list";
  iconClassName?: string;
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
export function HomeTaskItem({
  task,
  onToggleComplete,
  className,
  style,
  variant = "card",
  iconClassName,
}: HomeTaskItemProps) {
  const timeLabel = TIME_LABEL_BY_TYPE[task.timeType];
  const timeValue = getTimeValue(task);
  const [animateComplete, setAnimateComplete] = useState(false);
  const prevCompletedRef = useRef(task.isCompleted);

  useEffect(() => {
    const wasCompleted = prevCompletedRef.current;
    if (!wasCompleted && task.isCompleted) {
      setAnimateComplete(true);
      const timer = window.setTimeout(() => setAnimateComplete(false), 280);
      prevCompletedRef.current = task.isCompleted;
      return () => window.clearTimeout(timer);
    }
    prevCompletedRef.current = task.isCompleted;
  }, [task.isCompleted]);

  return (
    <Card
      className={cn("text-ink-900", className)}
      style={style}
      $isCompleted={task.isCompleted}
      $isFixedTime={task.isFixedTime}
      $variant={variant}
    >
      <Row>
        <CompleteButton
          type="button"
          aria-pressed={task.isCompleted}
          aria-label={task.isCompleted ? "완료됨" : "완료"}
          onClick={() => onToggleComplete(task.taskId)}
          $animate={animateComplete}
        >
          <Icon
            name={task.isCompleted ? "todo_check" : "todo_unchecked"}
            className={cn(
              "h-6 w-6",
              !task.isCompleted && variant === "card" && "text-primary-600",
              iconClassName,
            )}
            aria-hidden
          />
        </CompleteButton>
        <Content>
          <TitleRow>
            <Title
              $isCompleted={task.isCompleted}
              $variant={variant}
              $animateComplete={animateComplete}
            >
              {task.title}
            </Title>
            {task.isUrgent ? <UrgentBadge>중요</UrgentBadge> : null}
          </TitleRow>
          <MetaRow $variant={variant}>
            <MetaValue>{timeValue}</MetaValue>
          </MetaRow>
        </Content>
      </Row>
    </Card>
  );
}

function getTimeValue(task: TaskItemModel) {
  if (task.startTime && task.endTime) {
    return `${task.startTime} ~ ${task.endTime}`;
  }

  if (task.timeType === "ESTIMATED") {
    return task.estimatedTimeRange ?? EMPTY_TIME_TEXT;
  }

  return EMPTY_TIME_TEXT;
}

const Card = styled.article<{
  $isCompleted: boolean;
  $isFixedTime: boolean;
  $variant: "card" | "list";
}>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  z-index: 1;
  ${({ $variant }) =>
    $variant === "list"
      ? `
    padding: 10px 0 5px 5px;
    border-radius: 0;
    border: none;
    background: transparent;
  `
      : `
    background: #ffffff;
  `}
  ${({ $isFixedTime, $variant }) =>
    $variant === "card" && $isFixedTime ? "border-color: #FF6D6D;" : ""}
  ${({ $isCompleted, $variant }) => ($variant === "card" && $isCompleted ? "color: #9ca3af;" : "")}
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

const strikeIn = keyframes`
  from {
    transform: translateY(-50%) scaleX(0);
  }
  to {
    transform: translateY(-50%) scaleX(1);
  }
`;

const Title = styled.div<{
  $isCompleted: boolean;
  $variant: "card" | "list";
  $animateComplete: boolean;
}>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ $isCompleted, $variant }) =>
    $isCompleted ? "#9ca3af" : $variant === "list" ? "#541e0f" : "inherit"};
  position: relative;
  text-decoration: none;
  ${({ $isCompleted, $animateComplete }) =>
    $isCompleted
      ? css`
          &::after {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            top: 50%;
            height: 1px;
            background: currentColor;
            transform: translateY(-50%) scaleX(1);
            transform-origin: left center;
            ${$animateComplete
              ? css`
                  animation: ${strikeIn} 240ms ease-out;
                `
              : ""}
          }
        `
      : ""}
`;

const UrgentBadge = styled.span`
  padding: 2px 6px;
  border-radius: 999px;
  background: #fee2e2;
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
`;

const MetaRow = styled.div<{ $variant: "card" | "list" }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${({ $variant }) => ($variant === "list" ? "#b8aca4" : "inherit")};
  opacity: ${({ $variant }) => ($variant === "list" ? 1 : 0.7)};
`;

const MetaLabel = styled.span`
  min-width: 70px;
  font-weight: 600;
  color: inherit;
`;

const MetaValue = styled.span`
  font-weight: 500;
`;

const completePop = keyframes`
  0% {
    transform: scale(0.9);
  }
  45% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
`;

const CompleteButton = styled.button<{ $animate: boolean }>`
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
  ${({ $animate }) =>
    $animate
      ? css`
          animation: ${completePop} 260ms ease-out;
        `
      : ""}
`;
