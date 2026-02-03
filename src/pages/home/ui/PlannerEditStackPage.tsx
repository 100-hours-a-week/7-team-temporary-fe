"use client";

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  PointerSensor,
  TouchSensor,
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
  TaskBasketAddSheet,
  TaskBasketButton,
  type EditableTaskItemModel,
  type TodoCartTaskItemModel,
  homeQueryKeys,
  useDayPlanScheduleByIdQuery,
  TimeSlotGrid,
  useDayPlanSchedulesQuery,
  useHomePlanStore,
} from "@/features/home";
import type {
  DayPlanScheduleResponseDto,
  UpdateDayPlanSchedulePatchRequestDto,
} from "@/features/home/api";
import { updateDayPlanSchedule } from "@/features/home/api";
import { useMyProfileQuery, type UserFocusTimeZone } from "@/entities/user";
import { Icon } from "@/shared/ui/icon";
import { Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";
import { ConfirmDialog } from "@/shared/ui";
import { useToast } from "@/shared/ui/toast";
import { ExcludedListBottomSheet } from "./ExcludedListBottomSheet";
import { StackPageEntryContext, useStackPage } from "@/widgets/stack";
import { TaskBasketStackPage } from "./TaskBasketStackPage";

type DraggedTask = {
  type: "excluded" | "task";
  id: string;
  task: EditableTaskItemModel;
};
type TodoTask = TodoCartTaskItemModel & { status?: "TODO" | "DONE" };
type PreviewSlot = { hour: number; minute: number };
type InsertPreview = {
  scheduleId: number;
  position: "above" | "below";
  targetStartAt: string;
  targetEndAt: string;
  startAt: string;
  endAt: string;
};

const DEFAULT_DROP_DURATION_MINUTES = 30;

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
  const [activeDrag, setActiveDrag] = useState<DraggedTask | null>(null);
  const [draggingType, setDraggingType] = useState<DraggedTask["type"] | null>(null);
  const [previewSlot, setPreviewSlot] = useState<PreviewSlot | null>(null);
  const previewKeyRef = useRef<string | null>(null);
  const [insertPreview, setInsertPreview] = useState<InsertPreview | null>(null);
  const insertKeyRef = useRef<string | null>(null);
  const dragDurationRef = useRef(DEFAULT_DROP_DURATION_MINUTES);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<EditableTaskItemModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [resizePreviewMap, setResizePreviewMap] = useState<Record<number, string>>({});
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
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
  const { data: myProfile } = useMyProfileQuery();
  const invalidateScheduleKeys = useMemo(() => {
    const keys: Array<readonly unknown[]> = [];
    if (dayPlanId) {
      keys.push(homeQueryKeys.dayPlanScheduleById(dayPlanId, 1, 10));
    }
    if (dayPlanDate) {
      keys.push(homeQueryKeys.dayPlanSchedule(dayPlanDate, 1, 10));
    }
    return keys;
  }, [dayPlanDate, dayPlanId]);

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
  const previewDurationMinutes = dragDurationRef.current;
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

  useEffect(() => {
    if (!dayPlanId) return;
    if (scheduleQuery.isFetching) {
      console.log("[PlannerEditStackPage] 일정 조회 요청", {
        dayPlanId,
        page: 1,
        size: 10,
      });
    }
  }, [dayPlanId, scheduleQuery.isFetching]);

  useEffect(() => {
    if (scheduleQuery.isError) {
      console.error("[PlannerEditStackPage] 일정 조회 실패", scheduleQuery.error);
      return;
    }
    if (scheduleQuery.data) {
      console.log("[PlannerEditStackPage] 일정 조회 응답", scheduleQuery.data);
    }
  }, [scheduleQuery.data, scheduleQuery.error, scheduleQuery.isError]);

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
      payload: UpdateDayPlanSchedulePatchRequestDto;
      task: EditableTaskItemModel;
    }) => updateDayPlanSchedule(variables.scheduleId, variables.payload),
    onMutate: async (variables) => {
      captureScrollPosition();
      if (!dayPlanId) return undefined;
      const scheduleKey = homeQueryKeys.dayPlanScheduleById(dayPlanId, 1, 10);
      const excludedKey = homeQueryKeys.dayPlanSchedulesById(dayPlanId, "EXCLUDED", 1, 10);
      const prevSchedules = queryClient.getQueryData<DayPlanScheduleResponseDto>(scheduleKey);
      const prevExcluded = queryClient.getQueryData<DayPlanScheduleResponseDto>(excludedKey);

      queryClient.setQueryData(scheduleKey, (prev: DayPlanScheduleResponseDto | undefined) =>
        updateScheduleCache(
          prev,
          variables.scheduleId,
          variables.payload.startAt,
          variables.payload.endAt,
          variables.task,
        ),
      );
      queryClient.setQueryData(excludedKey, (prev: DayPlanScheduleResponseDto | undefined) =>
        removeScheduleCache(prev, variables.scheduleId),
      );

      requestAnimationFrame(() => {
        restoreScrollPosition();
      });

      return { prevSchedules, prevExcluded };
    },
    onError: (_error, _variables, context) => {
      if (!dayPlanId || !context) return;
      const scheduleKey = homeQueryKeys.dayPlanScheduleById(dayPlanId, 1, 10);
      const excludedKey = homeQueryKeys.dayPlanSchedulesById(dayPlanId, "EXCLUDED", 1, 10);
      if (context.prevSchedules) {
        queryClient.setQueryData(scheduleKey, context.prevSchedules);
      }
      if (context.prevExcluded) {
        queryClient.setQueryData(excludedKey, context.prevExcluded);
      }
      requestAnimationFrame(() => {
        restoreScrollPosition();
      });
    },
    onSuccess: () => {
      requestAnimationFrame(() => {
        restoreScrollPosition();
      });
    },
  });

  const hasResizeConflict = useCallback(
    (scheduleId: number, startAt: string, endAt: string) => {
      const startMinutes = parseTimeToMinutes(startAt);
      const endMinutes = parseTimeToMinutes(endAt);
      if (startMinutes === null || endMinutes === null) return true;
      if (endMinutes <= startMinutes) return true;
      return mergedTasks.some((task) => {
        if (task.scheduleId === scheduleId) return false;
        const taskStart = parseTimeToMinutes(task.startAt);
        const taskEnd = parseTimeToMinutes(task.endAt);
        if (taskStart === null || taskEnd === null) return false;
        return startMinutes < taskEnd && endMinutes > taskStart;
      });
    },
    [mergedTasks],
  );
  const deleteScheduleMutation = useApiMutation<number, void, void>({
    url: (scheduleId) => Endpoint.SCHEDULE.BY_ID(scheduleId),
    method: "DELETE",
    authRequired: true,
    refreshOnUnauthorized: true,
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
    if (!dayPlanId) return;
    queryClient.setQueryData(
      homeQueryKeys.dayPlanScheduleById(dayPlanId, 1, 10),
      (prev: DayPlanScheduleResponseDto | undefined) =>
        updateScheduleCache(
          prev,
          resolvedTask.scheduleId,
          resolvedTask.startAt,
          resolvedTask.endAt,
          resolvedTask,
        ),
    );
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
        if (dayPlanId) {
          queryClient.setQueryData(
            homeQueryKeys.dayPlanScheduleById(dayPlanId, 1, 10),
            (prev: DayPlanScheduleResponseDto | undefined) =>
              removeScheduleCache(prev, deleteTargetId),
          );
        }
        setIsDeleteDialogOpen(false);
        setDeleteTargetId(null);
      },
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const payload = event.active.data.current as DraggedTask | undefined;
    const dropData = event.over?.data.current as
      | { type?: string; hour?: number; minute?: number }
      | undefined;
    if (!payload) {
      setActiveDrag(null);
      setDraggingType(null);
      setPreviewSlot(null);
      previewKeyRef.current = null;
      setInsertPreview(null);
      insertKeyRef.current = null;
      dragDurationRef.current = DEFAULT_DROP_DURATION_MINUTES;
      restoreScrollPosition();
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
      setActiveDrag(null);
      setPreviewSlot(null);
      previewKeyRef.current = null;
      setInsertPreview(null);
      insertKeyRef.current = null;
      dragDurationRef.current = DEFAULT_DROP_DURATION_MINUTES;
      restoreScrollPosition();
      return;
    }

    if (isAfterDayEnd(startAt, endAt, dayEndMinutes)) {
      showToast("하루 마무리 시간 이후에는 배정할 수 없습니다.", "error");
      setActiveDrag(null);
      setPreviewSlot(null);
      previewKeyRef.current = null;
      setInsertPreview(null);
      insertKeyRef.current = null;
      dragDurationRef.current = DEFAULT_DROP_DURATION_MINUTES;
      restoreScrollPosition();
      return;
    }

    const nextTask: EditableTaskItemModel = {
      ...payload.task,
      startAt,
      endAt,
    };
    setDroppedTasks((prev) => {
      const map = new Map(prev.map((task) => [task.scheduleId, task]));
      map.set(nextTask.scheduleId, nextTask);
      return Array.from(map.values());
    });
    if (!dayPlanId) return;
    updateScheduleMutation.mutate({
      scheduleId: payload.task.scheduleId,
      payload: {
        targetDayPlanId: dayPlanId,
        startAt,
        endAt,
      },
      task: nextTask,
    });
    setActiveDrag(null);
    setDraggingType(null);
    setPreviewSlot(null);
    previewKeyRef.current = null;
    setInsertPreview(null);
    insertKeyRef.current = null;
    dragDurationRef.current = DEFAULT_DROP_DURATION_MINUTES;
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
  };

  return (
    <DndContext
      sensors={sensors}
      autoScroll={false}
      onDragStart={(event: DragStartEvent) => {
        const payload = event.active.data.current as DraggedTask | undefined;
        captureScrollPosition();
        dragDurationRef.current =
          getTaskDurationMinutes(payload?.task) ?? DEFAULT_DROP_DURATION_MINUTES;
        setDraggingType(payload?.type ?? null);
        setActiveDrag(payload?.type === "excluded" ? payload : null);
      }}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveDrag(null);
        setDraggingType(null);
        setPreviewSlot(null);
        previewKeyRef.current = null;
        setInsertPreview(null);
        insertKeyRef.current = null;
        dragDurationRef.current = DEFAULT_DROP_DURATION_MINUTES;
        restoreScrollPosition();
      }}
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
              onClick={handleOpenExcludedList}
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

        <div className="pointer-events-none fixed bottom-0 left-1/2 z-[60] w-full max-w-[420px] -translate-x-1/2">
          <button
            type="button"
            aria-label="플래너 수정"
            onClick={handleOpenTaskBasket}
            className="bg-ink-900 hover:bg-primary-500 pointer-events-auto absolute right-5 bottom-[calc(env(safe-area-inset-bottom)+110px)] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
          >
            <Icon
              name="basket"
              className="h-8 w-8"
              aria-hidden
            />
          </button>
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
          onAddTask={() => undefined}
          editingTask={editingTask}
          onUpdateTask={handleUpdateTask}
        />
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
  const baseTransform = CSS.Translate.toString(transform);
  const style = {
    transform: isDragging
      ? `${baseTransform ? `${baseTransform} ` : ""}scale(1.03)`
      : baseTransform,
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isDragging ? "0 18px 36px rgba(15, 23, 42, 0.28)" : "none",
    touchAction: "none",
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

function buildTimeRangeFromEnd(endAt: string, durationMinutes: number) {
  const endMinutes = parseTimeToMinutes(endAt);
  if (endMinutes === null) return endAt;
  const startMinutes = endMinutes - durationMinutes;
  return formatTime(startMinutes);
}

function parseTimeToMinutes(value: string | undefined | null) {
  if (!value) return null;
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

function isAfterDayEnd(startAt: string, endAt: string, dayEndMinutes: number | null) {
  if (dayEndMinutes === null) return false;
  const startMinutes = parseTimeToMinutes(startAt);
  const endMinutes = parseTimeToMinutes(endAt);
  if (startMinutes === null || endMinutes === null) return false;
  return startMinutes >= dayEndMinutes || endMinutes > dayEndMinutes;
}

function getDayEndLimitMinutes(dayEndTime?: string | null) {
  const parsed = parseTimeToMinutes(dayEndTime);
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

function getTaskDurationMinutes(task: EditableTaskItemModel | undefined | null) {
  if (!task) return null;
  const startMinutes = parseTimeToMinutes(task.startAt);
  const endMinutes = parseTimeToMinutes(task.endAt);
  if (startMinutes === null || endMinutes === null) return null;
  const duration = endMinutes - startMinutes;
  return duration > 0 ? duration : null;
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
          ? {
              ...item,
              title: task.title,
              type: task.type ?? item.type,
              startAt,
              endAt,
              estimatedTimeRange: task.estimatedTimeRange ?? item.estimatedTimeRange,
              focusLevel: task.focusLevel ?? item.focusLevel,
              isUrgent: task.isUrgent ?? item.isUrgent,
              assignedBy: task.assignedBy ?? item.assignedBy,
              status: task.status ?? item.status,
              assignmentStatus: task.assignmentStatus ?? item.assignmentStatus,
            }
          : item,
      )
    : [
        ...prev.content,
        {
          scheduleId,
          parentTitle: null,
          title: task.title,
          status: task.status,
          type: task.type,
          assignedBy: task.assignedBy,
          assignmentStatus: task.assignmentStatus,
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

function getPreviewTimeRange(
  previewSlot: PreviewSlot | null,
  insertPreview: InsertPreview | null,
  durationMinutes: number,
) {
  if (insertPreview) {
    return `${insertPreview.startAt} ~ ${insertPreview.endAt}`;
  }
  if (previewSlot) {
    const range = buildTimeRange(previewSlot.hour, previewSlot.minute, durationMinutes);
    return `${range.startAt} ~ ${range.endAt}`;
  }
  return "";
}
