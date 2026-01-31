import styled from "@emotion/styled";
import type { CSSProperties } from "react";
import { useCallback } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";

import type { EditableTaskItemModel } from "../model/taskModels";
import { TaskItemActionRow } from "./TaskItemActionRow";

interface EditableTaskItemProps {
  task: EditableTaskItemModel;
  isLocked: boolean;
  onUpdate: (payload: { scheduleId: number; startAt: string; endAt: string }) => void;
  onDelete: (scheduleId: number) => void;
  onExclude: (scheduleId: number) => void;
  className?: string;
  style?: CSSProperties;
  droppableId?: string;
  droppableData?: {
    type?: string;
    scheduleId: number;
    startAt: string;
    endAt: string;
    index: number;
  };
  insertPosition?: "above" | "below" | null;
  draggableId?: string;
  draggableData?: {
    type?: string;
    task: EditableTaskItemModel;
  };
  dragHandleLabel?: string;
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
  className,
  style,
  droppableId,
  droppableData,
  insertPosition = null,
  draggableId,
  draggableData,
  dragHandleLabel = "작업 드래그",
}: EditableTaskItemProps) {
  const isAiAssigned = task.assignedBy === "AI";
  const timeLabel = getTimeLabel(task);
  const timeValue = formatTimeRange(task.startAt, task.endAt);
  const { setNodeRef: setDropNodeRef } = useDroppable({
    id: droppableId ?? `task-${task.scheduleId}`,
    data: droppableData,
    disabled: !droppableData,
  });
  const {
    setNodeRef: setDragNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
  } = useDraggable({
    id: draggableId ?? `task-${task.scheduleId}`,
    data: draggableData,
    disabled: !draggableData,
  });
  const setNodeRef = useCallback(
    (node: HTMLDivElement | null) => {
      setDropNodeRef(node);
      setDragNodeRef(node);
    },
    [setDropNodeRef, setDragNodeRef],
  );

  return (
    <CardWrapper
      ref={setNodeRef}
      className={className}
      style={style}
    >
      {insertPosition === "above" ? <InsertLine $position="above" /> : null}
      <Card $isLocked={isLocked}>
        <ContentRow>
          <LeftColumn>
            <HandleButton
              type="button"
              ref={setActivatorNodeRef}
              aria-label={dragHandleLabel}
              {...attributes}
              {...listeners}
              disabled={!draggableData}
            />
            <TextColumn>
              <TitleRow>
                <Title>{task.title}</Title>
                {task.isUrgent ? <UrgentBadge>긴급</UrgentBadge> : null}
              </TitleRow>
              <MetaRow>
                <MetaInfo>
                  <MetaValue>{timeValue}</MetaValue>
                </MetaInfo>
                <AssignmentBadge $isAi={isAiAssigned}>
                  {isAiAssigned ? "AI" : "사용자"}
                </AssignmentBadge>
              </MetaRow>
            </TextColumn>
          </LeftColumn>
          <RightColumn>
            <TaskItemActionRow
              onEdit={() =>
                onUpdate({ scheduleId: task.scheduleId, startAt: task.startAt, endAt: task.endAt })
              }
              onDelete={() => onDelete(task.scheduleId)}
              isDisabled={isLocked}
            />
          </RightColumn>
        </ContentRow>
      </Card>
      {insertPosition === "below" ? <InsertLine $position="below" /> : null}
    </CardWrapper>
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
  height: 100%;
  box-sizing: border-box;
`;

const CardWrapper = styled.div`
  position: relative;
`;

const InsertLine = styled.div<{ $position: "above" | "below" }>`
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 107, 107, 0.7);
  ${({ $position }) => ($position === "above" ? "top: -6px;" : "bottom: -6px;")}
  pointer-events: none;
`;

const ContentRow = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
`;

const LeftColumn = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
  min-width: 0;
`;

const TextColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  line-height: 16px;
  min-width: 0;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  flex-shrink: 0;
  height: 100%;
  align-self: stretch;
`;

const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const HandleButton = styled.button`
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
  border: none;
  padding: 0;
  cursor: grab;
  flex-shrink: 0;

  &:disabled {
    cursor: default;
  }

  &:active {
    cursor: grabbing;
  }
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: #6b7280;
`;

const MetaInfo = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const MetaLabel = styled.span`
  min-width: 70px;
  font-weight: 600;
  color: #374151;
`;

const MetaValue = styled.span`
  font-weight: 500;
`;

const LockNotice = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;

const AiNotice = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;
