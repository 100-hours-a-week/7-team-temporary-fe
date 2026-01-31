"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import {
  END_HOUR,
  EditableTaskItem,
  ExcludedTaskItem,
  START_HOUR,
  TaskBasketButton,
  type EditableTaskItemModel,
  homeQueryKeys,
  useDayPlanScheduleByIdQuery,
  TimeSlotGrid,
  useDayPlanSchedulesQuery,
  useHomePlanStore,
} from "@/features/home";
import type { DayPlanScheduleResponseDto } from "@/features/home/api";
import { updateDayPlanSchedule } from "@/features/home/api";
import { ExcludedListBottomSheet } from "./ExcludedListBottomSheet";
import { StackPageEntryContext, useStackPage } from "@/widgets/stack";
import { TaskBasketStackPage } from "./TaskBasketStackPage";

type DraggedTask = {
  type: "excluded" | "task";
  id: string;
  task: EditableTaskItemModel;
};
type PreviewSlot = { hour: number; minute: number };
type InsertPreview = {
  scheduleId: number;
  position: "above" | "below";
  targetStartAt: string;
  targetEndAt: string;
};

export function PlannerEditStackPage() {
  const { push, setHeaderContent, stack } = useStackPage();
  const entry = useContext(StackPageEntryContext);
  const queryClient = useQueryClient();
  const prevDepthRef = useRef(stack.length);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const scrollParentRef = useRef<HTMLElement | null>(null);
  const lastScrollTopRef = useRef(0);
  const today = useMemo(() => new Date(), []);
  const dayPlanId = useHomePlanStore((state) => state.dayPlanId);
  const [droppedTasks, setDroppedTasks] = useState<EditableTaskItemModel[]>([]);
  const [activeDrag, setActiveDrag] = useState<DraggedTask | null>(null);
  const [previewSlot, setPreviewSlot] = useState<PreviewSlot | null>(null);
  const previewKeyRef = useRef<string | null>(null);
  const [insertPreview, setInsertPreview] = useState<InsertPreview | null>(null);
  const insertKeyRef = useRef<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const scheduleQuery = useDayPlanScheduleByIdQuery({
    dayPlanId: dayPlanId ?? 0,
    page: 1,
    size: 10,
    enabled: Boolean(dayPlanId),
  });
  const schedulesQuery = useDayPlanSchedulesQuery({
    dayPlanId: dayPlanId ?? 0,
    status: "EXCLUDED",
    page: 1,
    size: 10,
    enabled: Boolean(dayPlanId) && isSheetOpen,
  });

  const timeSlots = useMemo(
    () => Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => START_HOUR + index),
    [],
  );
  const tasks = useMemo(() => scheduleQuery.data?.content ?? [], [scheduleQuery.data]);
  const mergedTasks = useMemo(() => {
    if (droppedTasks.length === 0) return tasks;
    const map = new Map<number, EditableTaskItemModel>();
    tasks.forEach((task) => map.set(task.scheduleId, task));
    droppedTasks.forEach((task) => map.set(task.scheduleId, task));
    return Array.from(map.values());
  }, [droppedTasks, tasks]);
  const taskIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    mergedTasks.forEach((task, index) => map.set(task.scheduleId, index));
    return map;
  }, [mergedTasks]);
  const statusMessage = scheduleQuery.isLoading
    ? { text: "일정을 불러오는 중...", className: "text-neutral-500" }
    : scheduleQuery.isError
      ? { text: "일정을 불러오지 못했습니다.", className: "text-red-500" }
      : tasks.length === 0
        ? { text: "등록된 일정이 없습니다.", className: "text-neutral-500" }
        : null;

  useEffect(() => {
    setHeaderContent(<span className="text-xl font-semibold text-black">플래너 수정</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  useEffect(() => {
    scrollParentRef.current = getScrollParent(pageRef.current);
  }, []);

  const handleOpenTaskBasket = () => {
    push(<TaskBasketStackPage />);
  };

  const handleOpenExcludedList = () => {
    setIsSheetOpen(true);
    setIsSheetExpanded(false);
  };

  const excludedTasks = schedulesQuery.data?.content ?? [];
  const isTop = useMemo(() => {
    const topKey = stack[stack.length - 1]?.key ?? null;
    if (!entry?.entryKey) return stack.length === 0;
    return topKey === entry.entryKey;
  }, [entry?.entryKey, stack]);

  useEffect(() => {
    if (isTop && isSheetOpen) {
      schedulesQuery.refetch();
    }
  }, [isTop, isSheetOpen, schedulesQuery]);

  useEffect(() => {
    const prevDepth = prevDepthRef.current;
    const nextDepth = stack.length;
    prevDepthRef.current = nextDepth;

    if (prevDepth > nextDepth && isTop && dayPlanId) {
      queryClient.invalidateQueries({
        queryKey: homeQueryKeys.dayPlanScheduleById(dayPlanId, 1, 10),
      });
    }
  }, [dayPlanId, isTop, queryClient, stack.length]);

  const captureScrollPosition = () => {
    if (!scrollParentRef.current) {
      scrollParentRef.current = getScrollParent(pageRef.current);
    }
    const element = scrollParentRef.current;
    if (!element) return;
    lastScrollTopRef.current = element.scrollTop;
  };

  const restoreScrollPosition = () => {
    if (!scrollParentRef.current) {
      scrollParentRef.current = getScrollParent(pageRef.current);
    }
    const element = scrollParentRef.current;
    if (!element) return;
    const scrollTop = lastScrollTopRef.current;
    requestAnimationFrame(() => {
      element.scrollTop = scrollTop;
    });
  };

  const updateScheduleMutation = useMutation({
    mutationFn: async (variables: {
      scheduleId: number;
      payload: {
        title: string;
        type: "FIXED" | "FLEX";
        startAt: string;
        endAt: string;
        estimatedTimeRange?: DayPlanScheduleResponseDto["content"][number]["estimatedTimeRange"];
        focusLevel?: DayPlanScheduleResponseDto["content"][number]["focusLevel"];
        isUrgent?: DayPlanScheduleResponseDto["content"][number]["isUrgent"];
      };
      task: EditableTaskItemModel;
    }) => updateDayPlanSchedule(variables.scheduleId, variables.payload),
    onSuccess: (_, variables) => {
      if (!dayPlanId) return;
      const { scheduleId, payload, task } = variables;
      queryClient.setQueryData(
        homeQueryKeys.dayPlanScheduleById(dayPlanId, 1, 10),
        (prev: DayPlanScheduleResponseDto | undefined) =>
          updateScheduleCache(prev, scheduleId, payload.startAt, payload.endAt, task),
      );
      queryClient.setQueryData(
        homeQueryKeys.dayPlanSchedulesById(dayPlanId, "EXCLUDED", 1, 10),
        (prev: DayPlanScheduleResponseDto | undefined) => removeScheduleCache(prev, scheduleId),
      );
      restoreScrollPosition();
    },
    onError: () => {
      restoreScrollPosition();
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const payload = event.active.data.current as DraggedTask | undefined;
    const dropData = event.over?.data.current as
      | { type?: string; hour?: number; minute?: number }
      | undefined;
    if (!payload) {
      setActiveDrag(null);
      setPreviewSlot(null);
      previewKeyRef.current = null;
      setInsertPreview(null);
      insertKeyRef.current = null;
      restoreScrollPosition();
      return;
    }
    let startAt: string | null = null;
    let endAt: string | null = null;

    if (insertPreview) {
      startAt =
        insertPreview.position === "above"
          ? insertPreview.targetStartAt
          : insertPreview.targetEndAt;
      endAt = buildTimeRangeFromStart(startAt, 30);
    } else if (
      dropData?.type === "slot" &&
      dropData.hour !== undefined &&
      dropData.minute !== undefined
    ) {
      const range = buildTimeRange(dropData.hour, dropData.minute, 30);
      startAt = range.startAt;
      endAt = range.endAt;
    }

    if (!startAt || !endAt) {
      setActiveDrag(null);
      setPreviewSlot(null);
      previewKeyRef.current = null;
      setInsertPreview(null);
      insertKeyRef.current = null;
      restoreScrollPosition();
      return;
    }

    const nextTask = toEditableTask(payload.task, startAt, endAt);
    setDroppedTasks((prev) => {
      if (prev.some((task) => task.scheduleId === nextTask.scheduleId)) return prev;
      if (tasks.some((task) => task.scheduleId === nextTask.scheduleId)) return prev;
      return [...prev, nextTask];
    });
    updateScheduleMutation.mutate({
      scheduleId: payload.task.scheduleId,
      payload: {
        title: payload.task.title,
        type: "FIXED",
        startAt,
        endAt,
        estimatedTimeRange: payload.task.estimatedTimeRange ?? undefined,
        focusLevel: payload.task.focusLevel ?? undefined,
        isUrgent: payload.task.isUrgent ?? undefined,
      },
      task: nextTask,
    });
    setActiveDrag(null);
    setPreviewSlot(null);
    previewKeyRef.current = null;
    setInsertPreview(null);
    insertKeyRef.current = null;
    restoreScrollPosition();
  };

  const handleDragOver = (event: DragOverEvent) => {
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
      const activeRect = event.active.rect.current.translated ?? event.active.rect.current.initial;
      const activeCenterY = activeRect ? activeRect.top + activeRect.height / 2 : 0;
      const overMidY = overRect ? overRect.top + overRect.height / 2 : 0;
      const position: "above" | "below" = activeCenterY <= overMidY ? "above" : "below";
      const key = `${data.scheduleId}-${position}`;
      if (insertKeyRef.current !== key) {
        insertKeyRef.current = key;
        setInsertPreview({
          scheduleId: data.scheduleId,
          position,
          targetStartAt: data.startAt,
          targetEndAt: data.endAt,
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
  };

  return (
    <DndContext
      sensors={sensors}
      autoScroll={false}
      onDragStart={(event: DragStartEvent) => {
        const payload = event.active.data.current as DraggedTask | undefined;
        captureScrollPosition();
        setActiveDrag(payload?.type === "excluded" ? payload : null);
      }}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveDrag(null);
        setPreviewSlot(null);
        previewKeyRef.current = null;
        setInsertPreview(null);
        insertKeyRef.current = null;
        restoreScrollPosition();
      }}
    >
      <>
        <div
          ref={pageRef}
          className="px-6 pt-[13px] pb-32"
        >
          <div className="mb-4 text-[18px] font-semibold text-neutral-900">
            {today.getMonth() + 1}월 {today.getDate()}일{" "}
            {["일", "월", "화", "수", "목", "금", "토"][today.getDay()]}
          </div>
          <div className="flex items-start justify-end gap-2">
            <button
              type="button"
              className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800"
              onClick={handleOpenExcludedList}
            >
              제외리스트
            </button>
            <TaskBasketButton onClick={handleOpenTaskBasket} />
          </div>
          <TimeSlotGrid
            slots={timeSlots}
            tasks={mergedTasks}
            statusMessage={statusMessage}
            getTaskKey={(task) => task.scheduleId}
            getStartTime={(task) => task.startAt}
            getEndTime={(task) => task.endAt}
            renderTask={(task, style) => (
              <EditableTaskItem
                task={task}
                style={style}
                isLocked={false}
                onUpdate={() => undefined}
                onDelete={() => undefined}
                onExclude={() => undefined}
                droppableId={`task-${task.scheduleId}`}
                droppableData={{
                  type: "item",
                  scheduleId: task.scheduleId,
                  startAt: task.startAt,
                  endAt: task.endAt,
                  index: taskIndexMap.get(task.scheduleId) ?? 0,
                }}
                insertPosition={
                  insertPreview?.scheduleId === task.scheduleId ? insertPreview.position : null
                }
                draggableId={`task-${task.scheduleId}`}
                draggableData={{ type: "task", task }}
                dragHandleLabel="작업 드래그"
              />
            )}
            enableDropTargets
            dropTargetIdPrefix="planner-slot"
            previewSlot={previewSlot}
            previewDurationMinutes={30}
          />
        </div>

        <ExcludedListBottomSheet
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          expanded={isSheetExpanded}
          onExpandedChange={setIsSheetExpanded}
        >
          {schedulesQuery.isLoading ? (
            <div className="py-6 text-center text-sm text-neutral-400">
              제외된 작업을 불러오는 중...
            </div>
          ) : null}
          {schedulesQuery.isError ? (
            <div className="py-6 text-center text-sm text-neutral-400">
              제외된 작업을 불러오지 못했습니다.
            </div>
          ) : null}
          {!schedulesQuery.isLoading && !schedulesQuery.isError && excludedTasks.length === 0 ? (
            <div className="py-6 text-center text-sm text-neutral-400">제외된 작업이 없습니다.</div>
          ) : null}
          {excludedTasks.map((task) => (
            <DraggableExcludedTaskItem
              key={task.scheduleId}
              task={task as EditableTaskItemModel}
            />
          ))}
        </ExcludedListBottomSheet>
        <DragOverlay>
          {activeDrag ? (
            <div className="w-[240px]">
              <ExcludedTaskItem
                task={activeDrag.task}
                onRestore={() => undefined}
              />
              {previewSlot || insertPreview ? (
                <div className="mt-2 rounded-lg bg-white px-3 py-1 text-xs text-neutral-600 shadow">
                  {getPreviewTimeRange(previewSlot, insertPreview)}
                </div>
              ) : null}
            </div>
          ) : null}
        </DragOverlay>
      </>
    </DndContext>
  );
}

function DraggableExcludedTaskItem({ task }: { task: EditableTaskItemModel }) {
  const id = `excluded-${task.scheduleId}`;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { id, task, type: "excluded" },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <ExcludedTaskItem
        task={task}
        onRestore={() => undefined}
      />
    </div>
  );
}

function toEditableTask(
  task: EditableTaskItemModel,
  startAt: string,
  endAt: string,
): EditableTaskItemModel {
  return {
    scheduleId: task.scheduleId,
    title: task.title,
    status: "TODO",
    type: "FIXED",
    assignedBy: task.assignedBy ?? "USER",
    assignmentStatus: "ASSIGNED",
    startAt,
    endAt,
    estimatedTimeRange: task.estimatedTimeRange ?? null,
    focusLevel: task.focusLevel ?? null,
    isUrgent: task.isUrgent ?? false,
  };
}

function buildTimeRange(hour: number, minute: number, durationMinutes: number) {
  const startMinutes = hour * 60 + minute;
  const endMinutes = (startMinutes + durationMinutes) % (24 * 60);
  return {
    startAt: formatTime(startMinutes),
    endAt: formatTime(endMinutes),
  };
}

function buildTimeRangeFromStart(startAt: string, durationMinutes: number) {
  const [hourText, minuteText] = startAt.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return startAt;
  }
  const totalMinutes = hour * 60 + minute + durationMinutes;
  return formatTime(totalMinutes);
}

function formatTime(totalMinutes: number) {
  const minutes = Math.max(0, totalMinutes);
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function updateScheduleCache(
  prev: DayPlanScheduleResponseDto | undefined,
  scheduleId: number,
  startAt: string,
  endAt: string,
  task: EditableTaskItemModel,
) {
  if (!prev) return prev;
  const exists = prev.content.some((item) => item.scheduleId === scheduleId);
  const nextContent = exists
    ? prev.content.map((item) =>
        item.scheduleId === scheduleId
          ? { ...item, startAt, endAt, assignmentStatus: "ASSIGNED", type: "FIXED" }
          : item,
      )
    : [
        ...prev.content,
        {
          scheduleId,
          parentTitle: null,
          title: task.title,
          status: "TODO",
          type: "FIXED",
          assignedBy: task.assignedBy ?? "USER",
          assignmentStatus: "ASSIGNED",
          startAt,
          endAt,
          estimatedTimeRange: task.estimatedTimeRange ?? null,
          focusLevel: task.focusLevel ?? null,
          isUrgent: task.isUrgent ?? false,
        },
      ];
  return {
    ...prev,
    content: nextContent,
  };
}

function removeScheduleCache(prev: DayPlanScheduleResponseDto | undefined, scheduleId: number) {
  if (!prev) return prev;
  return {
    ...prev,
    content: prev.content.filter((item) => item.scheduleId !== scheduleId),
  };
}

function getScrollParent(element: HTMLElement | null) {
  if (!element || typeof window === "undefined") return null;
  let current: HTMLElement | null = element.parentElement;
  while (current) {
    const styles = window.getComputedStyle(current);
    if (
      styles.overflowY === "auto" ||
      styles.overflowY === "scroll" ||
      styles.overflow === "auto" ||
      styles.overflow === "scroll"
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

function getPreviewTimeRange(previewSlot: PreviewSlot | null, insertPreview: InsertPreview | null) {
  if (insertPreview) {
    const startAt =
      insertPreview.position === "above" ? insertPreview.targetStartAt : insertPreview.targetEndAt;
    const endAt = buildTimeRangeFromStart(startAt, 30);
    return `${startAt} ~ ${endAt}`;
  }
  if (previewSlot) {
    const range = buildTimeRange(previewSlot.hour, previewSlot.minute, 30);
    return `${range.startAt} ~ ${range.endAt}`;
  }
  return "";
}
