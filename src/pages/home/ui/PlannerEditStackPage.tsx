"use client";

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DndContext, DragOverlay } from "@dnd-kit/core";

import {
  END_HOUR,
  START_HOUR,
  TaskBasketAddSheet,
  useDeleteScheduleMutation,
} from "@/features/home";
import {
  dayPlanScheduleQueryKeys,
  EditableTaskItem,
  ExcludedTaskItem,
  type DayPlanScheduleListModel,
  type EditableTaskItemModel,
  type TodoCartTaskItemModel,
  useDayPlanScheduleByIdQuery,
} from "@/entities/day-plan-schedule";
import { useHomePlanStore } from "@/entities/day-plan";
import { useMyProfileQuery, type UserFocusTimeZone } from "@/entities/user";
import { FloatingActionButton } from "@/shared/ui/button/floating-action";
import { FloatingActionDock } from "@/shared/ui/button/floating-dock";
import { buildTimeRange, formatHHmmRange, isAfterDayEnd, parseHHmmToMinutes } from "@/shared/lib";
import { ConfirmDialog } from "@/shared/ui/dialogs";
import { useToast } from "@/shared/ui/toast";
import { StackPageEntryContext, useStackPage } from "@/widgets/stack";
import { TaskBasketStackPage } from "./TaskBasketStackPage";
import {
  ExcludedTasksSheet,
  TimeSlotGrid,
  capturePlannerEditScrollPosition,
  removeScheduleCache,
  restorePlannerEditScrollPosition,
  type PlannerEditInsertPreview,
  type PlannerEditPreviewSlot,
  usePlannerEditDnD,
  useExcludedTasksSheetState,
  usePlannerEditOptimisticUpdate,
  updateScheduleCache,
} from "@/widgets/planner-edit";

type TodoTask = TodoCartTaskItemModel & { status?: "TODO" | "DONE" };

export function PlannerEditStackPage() {
  const { push, setHeaderContent, stack } = useStackPage();
  const entry = useContext(StackPageEntryContext);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const prevDepthRef = useRef(stack.length);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const scrollParentRef = useRef<HTMLElement | null>(null);
  const lastScrollTopRef = useRef(0);
  const today = useMemo(() => new Date(), []);
  const dayPlanId = useHomePlanStore((state) => state.dayPlanId);
  const dayPlanDate = useHomePlanStore((state) => state.date);
  const [droppedTasks, setDroppedTasks] = useState<EditableTaskItemModel[]>([]);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<EditableTaskItemModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [resizePreviewMap, setResizePreviewMap] = useState<Record<number, string>>({});
  const {
    isExcludedSheetOpen,
    setIsExcludedSheetOpen,
    isExcludedSheetExpanded,
    setIsExcludedSheetExpanded,
    openExcludedTasksSheet,
  } = useExcludedTasksSheetState();
  const scheduleQuery = useDayPlanScheduleByIdQuery({
    dayPlanId: dayPlanId ?? 0,
    page: 1,
    size: 10,
    enabled: Boolean(dayPlanId),
  });
  const { data: myProfile } = useMyProfileQuery();
  const scheduleKeys = useMemo(
    () =>
      dayPlanScheduleQueryKeys.dayPlanScheduleCacheKeys({
        dayPlanId,
        dayPlanDate,
        page: 1,
        size: 10,
      }),
    [dayPlanDate, dayPlanId],
  );
  const invalidateScheduleKeys = scheduleKeys;

  const dayEndMinutes = useMemo(
    () => getDayEndLimitMinutes(myProfile?.dayEndTime),
    [myProfile?.dayEndTime],
  );
  const focusTimeRanges = useMemo(
    () => buildFocusTimeRanges(myProfile?.focusTimeZone),
    [myProfile?.focusTimeZone],
  );
  const focusTimeLabel = useMemo(
    () => formatFocusTimeLabel(myProfile?.focusTimeZone),
    [myProfile?.focusTimeZone],
  );
  const timeSlots = useMemo(
    () =>
      Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => START_HOUR + index).filter(
        (hour) => (dayEndMinutes === null ? true : hour * 60 < dayEndMinutes),
      ),
    [dayEndMinutes],
  );
  const selectedDate = useMemo(() => {
    if (!dayPlanDate) return today;
    const parsed = new Date(dayPlanDate);
    return Number.isNaN(parsed.getTime()) ? today : parsed;
  }, [dayPlanDate, today]);
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
  const sheetTasks = useMemo(() => {
    if (!editingTask) return mergedTasks;
    return mergedTasks.filter((task) => task.scheduleId !== editingTask.scheduleId);
  }, [editingTask, mergedTasks]);
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
    if (scheduleQuery.isError) {
      console.error("[PlannerEditStackPage] 일정 조회 실패", scheduleQuery.error);
    }
  }, [scheduleQuery.error, scheduleQuery.isError]);

  const handleOpenTaskBasket = () => {
    push(<TaskBasketStackPage />);
  };

  const isTop = useMemo(() => {
    const topKey = stack[stack.length - 1]?.key ?? null;
    if (!entry?.entryKey) return stack.length === 0;
    return topKey === entry.entryKey;
  }, [entry?.entryKey, stack]);

  useEffect(() => {
    const prevDepth = prevDepthRef.current;
    const nextDepth = stack.length;
    prevDepthRef.current = nextDepth;

    if (prevDepth > nextDepth && isTop && scheduleKeys.length > 0) {
      scheduleKeys.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
    }
  }, [isTop, queryClient, scheduleKeys, stack.length]);

  const captureScrollPosition = useCallback(() => {
    capturePlannerEditScrollPosition({
      pageRef,
      scrollParentRef,
      lastScrollTopRef,
    });
  }, []);

  const restoreScrollPosition = useCallback(() => {
    restorePlannerEditScrollPosition({
      pageRef,
      scrollParentRef,
      lastScrollTopRef,
    });
  }, []);
  const updateScheduleMutation = usePlannerEditOptimisticUpdate({
    dayPlanId,
    scheduleKeys,
    captureScrollPosition,
    restoreScrollPosition,
  });

  const hasResizeConflict = useCallback(
    (scheduleId: number, startAt: string, endAt: string) => {
      const startMinutes = parseHHmmToMinutes(startAt);
      const endMinutes = parseHHmmToMinutes(endAt);
      if (startMinutes === null || endMinutes === null) return true;
      if (endMinutes <= startMinutes) return true;
      return mergedTasks.some((task) => {
        if (task.scheduleId === scheduleId) return false;
        const taskStart = parseHHmmToMinutes(task.startAt);
        const taskEnd = parseHHmmToMinutes(task.endAt);
        if (taskStart === null || taskEnd === null) return false;
        return startMinutes < taskEnd && endMinutes > taskStart;
      });
    },
    [mergedTasks],
  );
  const deleteScheduleMutation = useDeleteScheduleMutation({
    invalidateKeys: invalidateScheduleKeys,
  });

  const handleEditTask = (task: EditableTaskItemModel) => {
    setEditingTask(task);
    setIsEditSheetOpen(true);
  };

  const handleEditSheetOpenChange = (nextOpen: boolean) => {
    setIsEditSheetOpen(nextOpen);
    if (!nextOpen) {
      setEditingTask(null);
    }
  };

  const handleUpdateTask = (nextTask: TodoTask) => {
    const baseTask = mergedTasks.find((task) => task.scheduleId === nextTask.scheduleId);
    const resolvedTask: EditableTaskItemModel = {
      scheduleId: nextTask.scheduleId,
      title: nextTask.title,
      status: nextTask.status ?? baseTask?.status ?? "TODO",
      type: nextTask.type,
      assignedBy: nextTask.assignedBy ?? baseTask?.assignedBy ?? "USER",
      assignmentStatus: baseTask?.assignmentStatus ?? "ASSIGNED",
      startAt: nextTask.startAt,
      endAt: nextTask.endAt,
      estimatedTimeRange: nextTask.estimatedTimeRange ?? baseTask?.estimatedTimeRange ?? null,
      focusLevel: nextTask.focusLevel ?? baseTask?.focusLevel ?? null,
      isUrgent: nextTask.isUrgent ?? baseTask?.isUrgent ?? null,
    };
    setDroppedTasks((prev) => {
      const map = new Map(prev.map((task) => [task.scheduleId, task]));
      map.set(resolvedTask.scheduleId, resolvedTask);
      return Array.from(map.values());
    });
    if (!dayPlanId || scheduleKeys.length === 0) return;
    scheduleKeys.forEach((key) => {
      queryClient.setQueryData(key, (prev: DayPlanScheduleListModel | undefined) =>
        updateScheduleCache(
          prev,
          resolvedTask.scheduleId,
          resolvedTask.startAt,
          resolvedTask.endAt,
          resolvedTask,
        ),
      );
    });
  };

  const handleResizePreview = (scheduleId: number, endAt: string) => {
    setResizePreviewMap((prev) => {
      if (prev[scheduleId] === endAt) return prev;
      return { ...prev, [scheduleId]: endAt };
    });
  };

  const clearResizePreview = (scheduleId: number) => {
    setResizePreviewMap((prev) => {
      if (!(scheduleId in prev)) return prev;
      const next = { ...prev };
      delete next[scheduleId];
      return next;
    });
  };

  const handleResizeEnd = (task: EditableTaskItemModel, endAt: string) => {
    clearResizePreview(task.scheduleId);
    if (endAt === task.endAt) return;
    if (isAfterDayEnd(task.startAt, endAt, dayEndMinutes)) {
      showToast("하루 마무리 시간 이후에는 배정할 수 없습니다.", "error");
      return;
    }
    if (hasResizeConflict(task.scheduleId, task.startAt, endAt)) {
      showToast("이미 다른 작업이 있는 시간입니다.", "error");
      return;
    }
    const nextTask: EditableTaskItemModel = { ...task, endAt };
    setDroppedTasks((prev) => {
      const map = new Map(prev.map((item) => [item.scheduleId, item]));
      map.set(task.scheduleId, nextTask);
      return Array.from(map.values());
    });
    if (!dayPlanId) return;
    updateScheduleMutation.mutate({
      scheduleId: task.scheduleId,
      payload: {
        targetDayPlanId: dayPlanId,
        startAt: nextTask.startAt,
        endAt: nextTask.endAt,
      },
      task: nextTask,
    });
  };

  const handleDeleteRequest = (scheduleId: number) => {
    setDeleteTargetId(scheduleId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    deleteScheduleMutation.mutate(deleteTargetId, {
      onSuccess: () => {
        setDroppedTasks((prev) => prev.filter((task) => task.scheduleId !== deleteTargetId));
        if (dayPlanId && scheduleKeys.length > 0) {
          scheduleKeys.forEach((key) => {
            queryClient.setQueryData(key, (prev: DayPlanScheduleListModel | undefined) =>
              removeScheduleCache(prev, deleteTargetId),
            );
          });
        }
        setIsDeleteDialogOpen(false);
        setDeleteTargetId(null);
      },
    });
  };

  const handleDropTask = useCallback(
    ({ task, startAt, endAt }: { task: EditableTaskItemModel; startAt: string; endAt: string }) => {
      const nextTask: EditableTaskItemModel = {
        ...task,
        startAt,
        endAt,
      };
      setDroppedTasks((prev) => {
        const map = new Map(prev.map((droppedTask) => [droppedTask.scheduleId, droppedTask]));
        map.set(nextTask.scheduleId, nextTask);
        return Array.from(map.values());
      });
      if (!dayPlanId) return;
      updateScheduleMutation.mutate({
        scheduleId: task.scheduleId,
        payload: {
          targetDayPlanId: dayPlanId,
          startAt,
          endAt,
        },
        task: nextTask,
      });
    },
    [dayPlanId, updateScheduleMutation],
  );

  const {
    sensors,
    activeDrag,
    draggingType,
    previewSlot,
    insertPreview,
    previewDurationMinutes,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
  } = usePlannerEditDnD({
    dayEndMinutes,
    captureScrollPosition,
    restoreScrollPosition,
    onInvalidDayEnd: () => {
      showToast("하루 마무리 시간 이후에는 배정할 수 없습니다.", "error");
    },
    onDropTask: handleDropTask,
  });

  return (
    <DndContext
      sensors={sensors}
      autoScroll={false}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <>
        <div
          ref={pageRef}
          className="text-ink-900 px-6 pt-[13px] pb-32"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="text-[18px] font-semibold text-neutral-900">
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일{" "}
              {["일", "월", "화", "수", "목", "금", "토"][selectedDate.getDay()]}
            </div>
            <button
              type="button"
              className="text-ink-900 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold"
              onClick={openExcludedTasksSheet}
            >
              제외리스트
            </button>
          </div>
          {focusTimeLabel ? (
            <div className="mt-3 text-sm font-semibold text-red-400">
              내 집중시간대: {focusTimeLabel}
            </div>
          ) : null}
          <TimeSlotGrid
            slots={timeSlots}
            tasks={mergedTasks}
            statusMessage={statusMessage}
            getTaskKey={(task) => task.scheduleId}
            getStartTime={(task) => task.startAt}
            getEndTime={(task) => resizePreviewMap[task.scheduleId] ?? task.endAt}
            renderTask={(task, style) => (
              <EditableTaskItem
                task={task}
                style={style}
                isLocked={false}
                onUpdate={() => handleEditTask(task)}
                onDelete={() => handleDeleteRequest(task.scheduleId)}
                onExclude={() => undefined}
                dayEndMinutes={dayEndMinutes}
                previewEndAt={resizePreviewMap[task.scheduleId]}
                droppableId={`task-${task.scheduleId}`}
                droppableData={
                  draggingType === "task"
                    ? undefined
                    : {
                        type: "item",
                        scheduleId: task.scheduleId,
                        startAt: task.startAt,
                        endAt: task.endAt,
                        index: taskIndexMap.get(task.scheduleId) ?? 0,
                      }
                }
                insertPosition={
                  insertPreview?.scheduleId === task.scheduleId ? insertPreview.position : null
                }
                draggableId={`task-${task.scheduleId}`}
                draggableData={{ type: "task", task }}
                dragHandleLabel="작업 드래그"
                onResizePreview={handleResizePreview}
                onResizeEnd={handleResizeEnd}
              />
            )}
            enableDropTargets
            dropTargetIdPrefix="planner-slot"
            previewSlot={previewSlot}
            previewDurationMinutes={previewDurationMinutes}
            endTimeMinutes={dayEndMinutes}
            highlightRanges={focusTimeRanges}
          />
        </div>

        <FloatingActionDock>
          <FloatingActionButton
            icon="basket"
            label="태스크 바스켓"
            onClick={handleOpenTaskBasket}
          />
        </FloatingActionDock>

        <ExcludedTasksSheet
          dayPlanId={dayPlanId}
          isTop={isTop}
          open={isExcludedSheetOpen}
          onOpenChange={setIsExcludedSheetOpen}
          expanded={isExcludedSheetExpanded}
          onExpandedChange={setIsExcludedSheetExpanded}
        />
        <DragOverlay>
          {activeDrag ? (
            <div className="w-[240px]">
              <ExcludedTaskItem
                task={activeDrag.task}
                onRestore={() => undefined}
              />
              {previewSlot || insertPreview ? (
                <div className="mt-2 rounded-lg bg-white px-3 py-1 text-xs text-neutral-600 shadow">
                  {getPreviewTimeRange(previewSlot, insertPreview, previewDurationMinutes)}
                </div>
              ) : null}
            </div>
          ) : null}
        </DragOverlay>

        <ConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);
            if (!open) {
              setDeleteTargetId(null);
            }
          }}
          title="정말 삭제할까요?"
          description="삭제한 작업은 복구할 수 없습니다."
          confirmText={deleteScheduleMutation.isPending ? "삭제 중..." : "삭제"}
          cancelText="취소"
          confirmDisabled={deleteScheduleMutation.isPending}
          cancelDisabled={deleteScheduleMutation.isPending}
          onConfirm={handleDeleteConfirm}
          contentClassName="bg-white rounded-3xl"
          trigger={
            <button
              type="button"
              className="hidden"
            />
          }
        />

        <TaskBasketAddSheet
          open={isEditSheetOpen}
          onOpenChange={handleEditSheetOpenChange}
          tasks={sheetTasks}
          dayPlanId={dayPlanId}
          invalidateKeys={invalidateScheduleKeys}
          editingTask={editingTask}
          onUpdateTask={handleUpdateTask}
        />
      </>
    </DndContext>
  );
}

function getDayEndLimitMinutes(dayEndTime?: string | null) {
  const parsed = parseHHmmToMinutes(dayEndTime);
  if (parsed === null) return null;
  if (parsed < 12 * 60) return null;
  return Math.floor(parsed / 10) * 10;
}

function buildFocusTimeRanges(focusTimeZone?: UserFocusTimeZone | null) {
  switch (focusTimeZone) {
    case "MORNING":
      return [{ startMinutes: 8 * 60, endMinutes: 12 * 60 }];
    case "AFTERNOON":
      return [{ startMinutes: 12 * 60, endMinutes: 18 * 60 }];
    case "EVENING":
      return [{ startMinutes: 18 * 60, endMinutes: 21 * 60 }];
    case "NIGHT":
      return [
        { startMinutes: 21 * 60, endMinutes: 24 * 60 },
        { startMinutes: 0, endMinutes: 8 * 60 },
      ];
    default:
      return [];
  }
}

function formatFocusTimeLabel(focusTimeZone?: UserFocusTimeZone | null) {
  switch (focusTimeZone) {
    case "MORNING":
      return "오전(08:00–12:00)";
    case "AFTERNOON":
      return "오후(12:00–18:00)";
    case "EVENING":
      return "저녁(18:00–21:00)";
    case "NIGHT":
      return "밤(21:00–08:00)";
    default:
      return null;
  }
}

function getPreviewTimeRange(
  previewSlot: PlannerEditPreviewSlot | null,
  insertPreview: PlannerEditInsertPreview | null,
  durationMinutes: number,
) {
  if (insertPreview) {
    return formatHHmmRange(insertPreview.startAt, insertPreview.endAt, "");
  }
  if (previewSlot) {
    const range = buildTimeRange(previewSlot.hour, previewSlot.minute, durationMinutes);
    return formatHHmmRange(range.startAt, range.endAt, "");
  }
  return "";
}
