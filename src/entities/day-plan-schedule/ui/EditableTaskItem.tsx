import styled from "@emotion/styled";
import type { CSSProperties, PointerEvent } from "react";
import { useCallback, useRef, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";

import type { EditableTaskItemModel } from "../model/taskModels";
import { formatHHmmRange, formatMinutesToHHmm, parseHHmmToMinutes } from "@/shared/lib";
import { TaskItemActionRow } from "./TaskItemActionRow";

interface EditableTaskItemProps {
  task: EditableTaskItemModel;
  isLocked: boolean;
  onUpdate: (payload: { scheduleId: number; startAt: string; endAt: string }) => void;
  onDelete: (scheduleId: number) => void;
  onExclude: (scheduleId: number) => void;
  className?: string;
  style?: CSSProperties;
  previewEndAt?: string | null;
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
  resizeHandleLabel?: string;
  onResizePreview?: (scheduleId: number, endAt: string) => void;
  onResizeEnd?: (task: EditableTaskItemModel, endAt: string) => void;
  dayEndMinutes?: number | null;
}

const EMPTY_TIME_TEXT = "시간 정보 없음";
const TEN_MINUTE_BLOCK_PX = 22;
const RESIZE_HANDLE_HEIGHT_PX = 10;
const RESIZE_SNAP_MINUTES = 10;
const MIN_RESIZE_MINUTES = 30;

/**
 * 플래너 수정 페이지에서 일정 편집을 위한 단일 작업 아이템.
 */
export function EditableTaskItem({
  task,
  isLocked,
  onUpdate,
  onDelete,
  onExclude: _onExclude,
  className,
  style,
  previewEndAt = null,
  droppableId,
  droppableData,
  insertPosition = null,
  draggableId,
  draggableData,
  dragHandleLabel = "작업 드래그",
  resizeHandleLabel = "작업 시간 조절",
  onResizePreview,
  onResizeEnd,
  dayEndMinutes = null,
}: EditableTaskItemProps) {
  const isAiAssigned = task.assignedBy === "AI";
  const [isResizing, setIsResizing] = useState(false);
  const [isHandleActive, setIsHandleActive] = useState(false);
  const [localPreviewEndAt, setLocalPreviewEndAt] = useState<string | null>(null);
  const resizeStateRef = useRef<{
    startY: number;
    startMinutes: number;
    endMinutes: number;
  } | null>(null);
  const effectiveEndAt = previewEndAt ?? localPreviewEndAt ?? task.endAt;
  const timeValue = formatHHmmRange(task.startAt, effectiveEndAt, EMPTY_TIME_TEXT);
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
    disabled: !draggableData || isResizing,
  });
  const setNodeRef = useCallback(
    (node: HTMLDivElement | null) => {
      setDropNodeRef(node);
      setDragNodeRef(node);
    },
    [setDropNodeRef, setDragNodeRef],
  );

  const handleResizePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (isLocked) return;
    const startMinutes = parseHHmmToMinutes(task.startAt);
    const endMinutes = parseHHmmToMinutes(task.endAt);
    if (startMinutes === null || endMinutes === null) return;
    event.preventDefault();
    event.stopPropagation();
    setIsResizing(true);
    resizeStateRef.current = {
      startY: event.clientY,
      startMinutes,
      endMinutes,
    };
    setLocalPreviewEndAt(task.endAt);
    onResizePreview?.(task.scheduleId, task.endAt);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleResizePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!isResizing || !resizeStateRef.current) return;
    event.preventDefault();
    const { startY, startMinutes, endMinutes } = resizeStateRef.current;
    const deltaY = event.clientY - startY;
    const step = Math.round(deltaY / TEN_MINUTE_BLOCK_PX);
    const deltaMinutes = step * RESIZE_SNAP_MINUTES;
    const minEndMinutes = startMinutes + MIN_RESIZE_MINUTES;
    let nextEndMinutes = clampMinutes(Math.max(minEndMinutes, endMinutes + deltaMinutes));
    if (dayEndMinutes !== null) {
      const maxAllowed = dayEndMinutes;
      nextEndMinutes = Math.min(nextEndMinutes, maxAllowed);
      if (maxAllowed < minEndMinutes) {
        nextEndMinutes = maxAllowed;
      }
    }
    const nextEndAt = formatMinutesToHHmm(nextEndMinutes);
    setLocalPreviewEndAt(nextEndAt);
    onResizePreview?.(task.scheduleId, nextEndAt);
  };

  const handleResizePointerEnd = (event: PointerEvent<HTMLButtonElement>) => {
    if (!isResizing) return;
    event.preventDefault();
    setIsResizing(false);
    const nextEndAt = localPreviewEndAt ?? task.endAt;
    setLocalPreviewEndAt(null);
    resizeStateRef.current = null;
    onResizeEnd?.(task, nextEndAt);
  };

  const handleResizePointerCancel = (event: PointerEvent<HTMLButtonElement>) => {
    if (!isResizing) return;
    event.preventDefault();
    setIsResizing(false);
    setLocalPreviewEndAt(null);
    resizeStateRef.current = null;
    onResizeEnd?.(task, task.endAt);
  };

  return (
    <CardWrapper
      ref={setNodeRef}
      className={className}
      style={style}
    >
      {insertPosition === "above" ? <InsertLine $position="above" /> : null}
      <Card
        $isLocked={isLocked}
        $isHandleActive={isHandleActive}
      >
        <ContentRow>
          <LeftColumn>
            <HandleButton
              type="button"
              ref={setActivatorNodeRef}
              aria-label={dragHandleLabel}
              onMouseEnter={() => setIsHandleActive(true)}
              onMouseLeave={() => setIsHandleActive(false)}
              onFocus={() => setIsHandleActive(true)}
              onBlur={() => setIsHandleActive(false)}
              onPointerDown={() => setIsHandleActive(true)}
              onPointerUp={() => setIsHandleActive(false)}
              onPointerCancel={() => setIsHandleActive(false)}
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
        <ResizeHandle
          type="button"
          aria-label={resizeHandleLabel}
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerEnd}
          onPointerCancel={handleResizePointerCancel}
          disabled={isLocked}
          $isActive={isResizing}
        />
      </Card>
      {insertPosition === "below" ? <InsertLine $position="below" /> : null}
    </CardWrapper>
  );
}

function clampMinutes(value: number) {
  return Math.min(24 * 60, Math.max(0, value));
}

const Card = styled.article<{ $isLocked: boolean; $isHandleActive: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: ${({ $isLocked }) => ($isLocked ? "#f9fafb" : "#ffffff")};
  opacity: ${({ $isLocked }) => ($isLocked ? 0.7 : 1)};
  height: 100%;
  box-sizing: border-box;
  transform: ${({ $isHandleActive }) => ($isHandleActive ? "scale(1.02)" : "scale(1)")};
  transition: transform 120ms ease;
  transform-origin: center;
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

const ResizeHandle = styled.button<{ $isActive: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: ${RESIZE_HANDLE_HEIGHT_PX}px;
  border: none;
  background: transparent;
  padding: 0;
  cursor: ns-resize;
  z-index: 2;
  touch-action: none;
  user-select: none;

  &::before {
    content: "";
    display: block;
    width: 36px;
    height: 2px;
    margin: 0 auto;
    border-radius: 999px;
    background: ${({ $isActive }) => ($isActive ? "#6366f1" : "#e5e7eb")};
  }

  &:disabled {
    cursor: default;
  }
`;

const HandleButton = styled.button`
  width: 14px;
  height: 14px;
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
  touch-action: none;
  user-select: none;

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

const MetaValue = styled.span`
  font-weight: 500;
`;
