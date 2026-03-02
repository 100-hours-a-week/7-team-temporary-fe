"use client";

import { useCallback, useRef, useState } from "react";
import {
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import type { EditableTaskItemModel } from "@/entities/day-plan";
import {
  buildTimeRange,
  buildTimeRangeFromEnd,
  buildTimeRangeFromStart,
  parseHHmmToMinutes,
  isAfterDayEnd,
} from "@/shared/lib";

import { resetDragState } from "../lib/resetDragState";

const DEFAULT_DROP_DURATION_MINUTES = 30;

export type PlannerEditDraggedTask = {
  type: "excluded" | "task";
  id: string;
  task: EditableTaskItemModel;
};

export type PlannerEditPreviewSlot = {
  hour: number;
  minute: number;
};

export type PlannerEditInsertPreview = {
  scheduleId: number;
  position: "above" | "below";
  targetStartAt: string;
  targetEndAt: string;
  startAt: string;
  endAt: string;
};

type UsePlannerEditDnDParams = {
  dayEndMinutes: number | null;
  captureScrollPosition: () => void;
  restoreScrollPosition: () => void;
  onInvalidDayEnd: () => void;
  onDropTask: (params: { task: EditableTaskItemModel; startAt: string; endAt: string }) => void;
};

export function usePlannerEditDnD({
  dayEndMinutes,
  captureScrollPosition,
  restoreScrollPosition,
  onInvalidDayEnd,
  onDropTask,
}: UsePlannerEditDnDParams) {
  const [activeDrag, setActiveDrag] = useState<PlannerEditDraggedTask | null>(null);
  const [draggingType, setDraggingType] = useState<PlannerEditDraggedTask["type"] | null>(null);
  const [previewSlot, setPreviewSlot] = useState<PlannerEditPreviewSlot | null>(null);
  const previewKeyRef = useRef<string | null>(null);
  const [insertPreview, setInsertPreview] = useState<PlannerEditInsertPreview | null>(null);
  const insertKeyRef = useRef<string | null>(null);
  const dragDurationRef = useRef(DEFAULT_DROP_DURATION_MINUTES);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const resetPlannerDragState = useCallback(() => {
    resetDragState({
      setActiveDrag,
      setDraggingType,
      setPreviewSlot,
      setInsertPreview,
      previewKeyRef,
      insertKeyRef,
      dragDurationRef,
      defaultDurationMinutes: DEFAULT_DROP_DURATION_MINUTES,
      restoreScrollPosition,
    });
  }, [restoreScrollPosition]);

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const payload = event.active.data.current as PlannerEditDraggedTask | undefined;
      captureScrollPosition();
      dragDurationRef.current =
        getTaskDurationMinutes(payload?.task) ?? DEFAULT_DROP_DURATION_MINUTES;
      setDraggingType(payload?.type ?? null);
      setActiveDrag(payload?.type === "excluded" ? payload : null);
    },
    [captureScrollPosition],
  );

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      const data = event.over?.data.current as
        | {
            type?: string;
            hour?: number;
            minute?: number;
            scheduleId?: number;
            startAt?: string;
            endAt?: string;
          }
        | undefined;

      if (data?.type === "item" && data.scheduleId && data.startAt && data.endAt) {
        const overRect = event.over?.rect;
        const activeRect =
          event.active.rect.current.translated ?? event.active.rect.current.initial;
        const activeCenterY = activeRect ? activeRect.top + activeRect.height / 2 : 0;
        const overMidY = overRect ? overRect.top + overRect.height / 2 : 0;
        const position: "above" | "below" = activeCenterY <= overMidY ? "above" : "below";
        const previewStart =
          position === "above"
            ? buildTimeRangeFromEnd(data.startAt, dragDurationRef.current)
            : data.endAt;
        const previewEnd =
          position === "above"
            ? data.startAt
            : buildTimeRangeFromStart(previewStart, dragDurationRef.current);

        if (isAfterDayEnd(previewStart, previewEnd, dayEndMinutes)) {
          if (insertPreview) {
            setInsertPreview(null);
            insertKeyRef.current = null;
          }
          if (previewSlot) {
            setPreviewSlot(null);
            previewKeyRef.current = null;
          }
          return;
        }

        const key = `${data.scheduleId}-${position}`;
        if (insertKeyRef.current !== key) {
          insertKeyRef.current = key;
          setInsertPreview({
            scheduleId: data.scheduleId,
            position,
            targetStartAt: data.startAt,
            targetEndAt: data.endAt,
            startAt: previewStart,
            endAt: previewEnd,
          });
        }

        if (previewSlot) {
          setPreviewSlot(null);
          previewKeyRef.current = null;
        }
        return;
      }

      if (data?.type === "slot" && data.hour !== undefined && data.minute !== undefined) {
        const key = `${data.hour}-${data.minute}`;
        if (previewKeyRef.current !== key) {
          previewKeyRef.current = key;
          setPreviewSlot({ hour: data.hour, minute: data.minute });
        }
        if (insertPreview) {
          setInsertPreview(null);
          insertKeyRef.current = null;
        }
        return;
      }

      if (previewSlot) {
        setPreviewSlot(null);
        previewKeyRef.current = null;
      }
      if (insertPreview) {
        setInsertPreview(null);
        insertKeyRef.current = null;
      }
    },
    [dayEndMinutes, insertPreview, previewSlot],
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const payload = event.active.data.current as PlannerEditDraggedTask | undefined;
      const dropData = event.over?.data.current as
        | { type?: string; hour?: number; minute?: number }
        | undefined;

      if (!payload) {
        resetPlannerDragState();
        return;
      }

      let startAt: string | null = null;
      let endAt: string | null = null;
      const durationMinutes = dragDurationRef.current;

      if (insertPreview) {
        startAt = insertPreview.startAt;
        endAt = insertPreview.endAt;
      } else if (
        dropData?.type === "slot" &&
        dropData.hour !== undefined &&
        dropData.minute !== undefined
      ) {
        const range = buildTimeRange(dropData.hour, dropData.minute, durationMinutes);
        startAt = range.startAt;
        endAt = range.endAt;
      }

      if (!startAt || !endAt) {
        resetPlannerDragState();
        return;
      }

      if (isAfterDayEnd(startAt, endAt, dayEndMinutes)) {
        onInvalidDayEnd();
        resetPlannerDragState();
        return;
      }

      onDropTask({ task: payload.task, startAt, endAt });
      resetPlannerDragState();
    },
    [dayEndMinutes, insertPreview, onDropTask, onInvalidDayEnd, resetPlannerDragState],
  );

  const previewDurationMinutes = dragDurationRef.current;

  return {
    sensors,
    activeDrag,
    draggingType,
    previewSlot,
    insertPreview,
    previewDurationMinutes,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel: resetPlannerDragState,
    resetPlannerDragState,
  };
}

function getTaskDurationMinutes(task: EditableTaskItemModel | undefined | null) {
  if (!task) return null;
  const startMinutes = parseHHmmToMinutes(task.startAt);
  const endMinutes = parseHHmmToMinutes(task.endAt);
  if (startMinutes === null || endMinutes === null) return null;
  const duration = endMinutes - startMinutes;
  return duration > 0 ? duration : null;
}
