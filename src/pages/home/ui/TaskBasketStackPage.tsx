"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { TaskSplitGroup, TaskSplitItem } from "@/features/home";
import type { TodoCartTaskItemModel } from "@/entities/day-plan";
import { TaskBasketAddSheet, TaskSplitSheetContent } from "@/features/home";
import {
  dayPlanQueryKeys,
  useDayPlanScheduleByIdQuery,
  useHomePlanStore,
} from "@/entities/day-plan";
import { ApiError, Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";
import { BottomSheet, ConfirmDialog } from "@/shared/ui";
import { Icon } from "@/shared/ui/icon";
import { FixedActionBar, PrimaryButton } from "@/shared/ui/button";
import { useStackPage } from "@/widgets/stack";
import { useToast } from "@/shared/ui/toast";
import { TodoList } from "@/widgets/planner-edit";
import { AiArrangeSheetContent } from "./AiArrangeSheet";

type TodoTask = TodoCartTaskItemModel & { status?: "TODO" | "DONE" };
type FlowStep = "idle" | "loading" | "ai" | "taskSplit";
type ScheduleChildrenPayload = {
  schedules: Array<{
    parentScheduleId: number;
    titles: string[];
  }>;
};

const LONG_DURATION_VALUES = new Set(["HOUR_2_TO_4", "HOUR_OVER_4", "2~4시간", "4시간~"]);
const OVER_FOUR_HOURS_VALUES = new Set(["HOUR_OVER_4", "4시간~"]);

const createTaskSplitItem = (id: TaskSplitItem["id"]): TaskSplitItem => ({
  id,
  value: "",
  placeholder: "하위 작업을 입력하세요",
});

const getMinItemsByDuration = (duration?: string | null) =>
  OVER_FOUR_HOURS_VALUES.has(duration ?? "") ? 3 : 2;

const buildTaskSplitGroups = (items: TodoTask[]): TaskSplitGroup[] =>
  items.map((task) => {
    const minItems = getMinItemsByDuration(task.estimatedTimeRange);
    return {
      id: task.scheduleId,
      title: task.title,
      minItems,
      items: Array.from({ length: minItems }, (_, index) =>
        createTaskSplitItem(`${task.scheduleId}-${index + 1}`),
      ),
    };
  });

export function TaskBasketStackPage() {
  const { setHeaderContent, pop } = useStackPage();
  const { showToast } = useToast();
  const today = useMemo(() => new Date(), []);
  const dayPlanId = useHomePlanStore((state) => state.dayPlanId);
  const dayPlanDate = useHomePlanStore((state) => state.date);
  const aiUsageRemainingCount = useHomePlanStore((state) => state.aiUsageRemainingCount);
  const setAiUsageRemainingCount = useHomePlanStore((state) => state.setAiUsageRemainingCount);
  const scrollRootRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoTask | null>(null);
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [flowStep, setFlowStep] = useState<FlowStep>("idle");
  const [aiPromptHandled, setAiPromptHandled] = useState(false);
  const [taskSplitHandled, setTaskSplitHandled] = useState(false);
  const [aiArrangeError, setAiArrangeError] = useState(false);
  const [splitGroups, setSplitGroups] = useState<TaskSplitGroup[]>([]);
  const [splitGroupsKey, setSplitGroupsKey] = useState("");

  const scheduleQuery = useDayPlanScheduleByIdQuery({
    dayPlanId: dayPlanId ?? 0,
    page: 1,
    size: 10,
    enabled: Boolean(dayPlanId),
  });
  const selectedDate = useMemo(() => {
    if (!dayPlanDate) return today;
    const parsed = new Date(dayPlanDate);
    return Number.isNaN(parsed.getTime()) ? today : parsed;
  }, [dayPlanDate, today]);
  const invalidateScheduleKeys = useMemo(
    () =>
      dayPlanQueryKeys.dayPlanScheduleCacheKeys({
        dayPlanId,
        dayPlanDate,
        page: 1,
        size: 10,
      }),
    [dayPlanDate, dayPlanId],
  );

  const deleteScheduleMutation = useApiMutation<number, void, void>({
    url: (scheduleId) => Endpoint.SCHEDULE.BY_ID(scheduleId),
    method: "DELETE",
    authRequired: true,
    refreshOnUnauthorized: true,
    invalidateKeys: invalidateScheduleKeys,
  });

  const aiArrangeMutation = useApiMutation<void, void, void>({
    url: () => {
      if (!dayPlanId) {
        throw new Error("dayPlanId가 없습니다.");
      }
      return Endpoint.DAY_PLAN.AI_ARRANGEMENT(dayPlanId);
    },
    method: "POST",
    authRequired: true,
    refreshOnUnauthorized: true,
    invalidateKeys: invalidateScheduleKeys,
  });

  const scheduleChildrenMutation = useApiMutation<
    ScheduleChildrenPayload,
    ScheduleChildrenPayload,
    void
  >({
    url: Endpoint.SCHEDULE.CHILDREN,
    method: "POST",
    authRequired: true,
    refreshOnUnauthorized: true,
    dtoFn: (payload) => payload,
    invalidateKeys: invalidateScheduleKeys,
    onSuccess: () => {
      setTaskSplitHandled(true);
      setFlowStep("idle");
    },
  });

  useEffect(() => {
    setHeaderContent(<span className="text-xl font-semibold text-black">작업 리스트</span>);
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  useEffect(() => {
    if (!scheduleQuery.data) return;
    const nextCount = scheduleQuery.data.aiUsageRemainingCount ?? null;
    setAiUsageRemainingCount(nextCount);
  }, [scheduleQuery.data, setAiUsageRemainingCount]);

  useEffect(() => {
    if (!contentRef.current) return;
    scrollRootRef.current = contentRef.current.closest(
      ".overflow-y-auto, .overflow-auto, .overflow-y-scroll",
    ) as HTMLElement | null;
  }, []);

  const fetchedTasks = useMemo(
    () =>
      scheduleQuery.data?.content.map((item) => ({
        scheduleId: item.scheduleId,
        title: item.title,
        type: item.type,
        startAt: item.startAt,
        endAt: item.endAt,
        estimatedTimeRange: item.estimatedTimeRange,
        focusLevel: item.focusLevel,
        isUrgent: item.isUrgent,
        assignedBy: item.assignedBy,
        assignmentStatus: item.assignmentStatus,
        status: item.status,
      })) ?? [],
    [scheduleQuery.data],
  );

  const mergedTasks = useMemo(() => {
    const map = new Map<number, TodoTask>();
    fetchedTasks.forEach((task) => map.set(task.scheduleId, task));
    tasks.forEach((task) => map.set(task.scheduleId, task));
    return Array.from(map.values());
  }, [fetchedTasks, tasks]);

  const longDurationCandidates = useMemo(
    () => mergedTasks.filter((task) => LONG_DURATION_VALUES.has(task.estimatedTimeRange ?? "")),
    [mergedTasks],
  );
  const taskSplitCandidates = longDurationCandidates;
  const hasFlexTask = mergedTasks.some((task) => task.type === "FLEX");
  const shouldShowAiPrompt = hasFlexTask;
  const shouldShowTaskSplitPrompt = taskSplitCandidates.length > 0;
  const flowSignature = useMemo(
    () =>
      `${mergedTasks.length}:${hasFlexTask}:${taskSplitCandidates
        .map((task) => task.scheduleId)
        .join(",")}`,
    [hasFlexTask, mergedTasks.length, taskSplitCandidates],
  );

  const shouldShowAiStep = shouldShowAiPrompt && !aiPromptHandled;
  const shouldShowTaskSplitStep = shouldShowTaskSplitPrompt && !taskSplitHandled;

  useEffect(() => {
    if (aiArrangeError) {
      setFlowStep(shouldShowTaskSplitStep ? "taskSplit" : "idle");
      return;
    }
    setAiPromptHandled(false);
    setTaskSplitHandled(false);
    setSplitGroupsKey("");
    setSplitGroups([]);
    setFlowStep("idle");
  }, [aiArrangeError, flowSignature, shouldShowTaskSplitStep]);

  useEffect(() => {
    if (flowStep !== "loading") return;
    if (scheduleQuery.isLoading) return;
    if (shouldShowTaskSplitStep) {
      setFlowStep("taskSplit");
      return;
    }
    if (shouldShowAiStep) {
      setFlowStep("ai");
      return;
    }
    setFlowStep("idle");
  }, [flowStep, scheduleQuery.isLoading, shouldShowAiStep, shouldShowTaskSplitStep]);

  useEffect(() => {
    if (flowStep !== "taskSplit") return;
    if (!shouldShowTaskSplitStep) return;
    const nextKey = taskSplitCandidates.map((task) => task.scheduleId).join(",");
    if (splitGroupsKey === nextKey) return;
    setSplitGroups(buildTaskSplitGroups(taskSplitCandidates));
    setSplitGroupsKey(nextKey);
  }, [flowStep, shouldShowTaskSplitStep, splitGroupsKey, taskSplitCandidates]);

  const handleOpenSheet = () => {
    setIsSheetOpen(true);
  };

  const handleAiArrange = () => {
    if (!dayPlanId || aiArrangeMutation.isPending) return;
    aiArrangeMutation.mutate(undefined, {
      onSuccess: () => {
        showToast("AI 자동 배치가 완료되었습니다.", "success");
        setAiPromptHandled(true);
        setAiArrangeError(false);
        setFlowStep("loading");
        pop();
      },
      onError: (error) => {
        if (error instanceof ApiError && error.httpStatus === 400) {
          showToast(error.message || "AI 자동 배치 사용 가능 횟수를 모두 사용했습니다.", "error");
        }
        setAiPromptHandled(false);
        setAiArrangeError(true);
        setFlowStep(shouldShowTaskSplitStep ? "taskSplit" : "idle");
      },
    });
  };

  const handleAiCancel = () => {
    setAiPromptHandled(false);
    setAiArrangeError(false);
    setTaskSplitHandled(true);
    setFlowStep("idle");
  };

  const handleFlowOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      if (flowStep === "ai" && aiArrangeMutation.isPending) return;
      if (flowStep === "ai") setAiPromptHandled(false);
      if (flowStep === "taskSplit") setTaskSplitHandled(true);
      setAiArrangeError(false);
      setFlowStep("idle");
    }
  };

  const handleTaskSplitSubmit = () => {
    if (scheduleChildrenMutation.isPending) return;
    const schedules = splitGroups
      .map((group) => {
        const parentScheduleId = Number(group.id);
        if (Number.isNaN(parentScheduleId)) return null;
        const titles = group.items.map((item) => item.value.trim()).filter(Boolean);
        if (titles.length === 0) return null;
        return { parentScheduleId, titles };
      })
      .filter((item): item is ScheduleChildrenPayload["schedules"][number] => item !== null);

    if (schedules.length === 0) return;
    scheduleChildrenMutation.mutate({ schedules });
  };

  const handleAddSplitItem = (groupId: TaskSplitGroup["id"]) => {
    setSplitGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              items: [...group.items, createTaskSplitItem(`${group.id}-${Date.now()}`)],
            }
          : group,
      ),
    );
  };

  const handleChangeSplitItem = (
    groupId: TaskSplitGroup["id"],
    itemId: TaskSplitItem["id"],
    value: string,
  ) => {
    setSplitGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              items: group.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      value,
                    }
                  : item,
              ),
            }
          : group,
      ),
    );
  };

  const handleRemoveSplitItem = (groupId: TaskSplitGroup["id"], itemId: TaskSplitItem["id"]) => {
    setSplitGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        const minItems = group.minItems ?? 1;
        if (group.items.length <= minItems) return group;
        return {
          ...group,
          items: group.items.filter((item) => item.id !== itemId),
        };
      }),
    );
  };

  const handleOpenFlowSheet = () => {
    if (flowStep !== "idle") return;
    if (scheduleQuery.isLoading) {
      setFlowStep("loading");
      return;
    }
    if (shouldShowTaskSplitStep) {
      setFlowStep("taskSplit");
      return;
    }
    if (shouldShowAiStep) {
      setFlowStep("ai");
      return;
    }
    setFlowStep("loading");
  };

  const handleEditTask = (task: TodoTask) => {
    setEditingTask(task);
    setIsSheetOpen(true);
  };

  const handleDeleteRequest = (scheduleId: number) => {
    setDeleteTargetId(scheduleId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    deleteScheduleMutation.mutate(deleteTargetId, {
      onSuccess: () => {
        setTasks((prev) => prev.filter((task) => task.scheduleId !== deleteTargetId));
        setIsDeleteDialogOpen(false);
        setDeleteTargetId(null);
      },
    });
  };

  const handleSheetOpenChange = (nextOpen: boolean) => {
    setIsSheetOpen(nextOpen);
    if (!nextOpen) {
      setEditingTask(null);
    }
  };

  const handleUpdateTask = (nextTask: TodoTask) => {
    setTasks((prev) => {
      const map = new Map(prev.map((task) => [task.scheduleId, task]));
      map.set(nextTask.scheduleId, nextTask);
      return Array.from(map.values());
    });
  };

  return (
    <>
      <div
        ref={contentRef}
        className="px-6 pt-[13px] pb-32"
      >
        <div className="text-[18px] font-bold text-neutral-900">
          {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일{" "}
          {["일", "월", "화", "수", "목", "금", "토"][selectedDate.getDay()]}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[18px] font-medium text-neutral-900">수행되지 않은 Todo list</div>
          <button
            type="button"
            className="text-primary-400 flex h-11 w-11 items-center justify-center rounded-xl text-2xl"
            aria-label="할 일 추가"
            onClick={handleOpenSheet}
          >
            <Icon
              name="calendar_plus"
              className="h-6 w-6"
              aria-hidden
            />
          </button>
        </div>
        <div className="mt-3">
          <TodoList
            tasks={tasks}
            dayPlanId={dayPlanId}
            onEdit={handleEditTask}
            onDelete={handleDeleteRequest}
            scrollRootRef={scrollRootRef}
          />
        </div>
      </div>

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

      <FixedActionBar>
        <PrimaryButton
          className="w-full"
          onClick={handleOpenFlowSheet}
        >
          플래너 배치하기
        </PrimaryButton>
      </FixedActionBar>

      <BottomSheet
        open={flowStep !== "idle"}
        onOpenChange={handleFlowOpenChange}
        peekHeight={flowStep === "taskSplit" ? 70 : 35}
        expandHeight={flowStep === "taskSplit" ? 70 : 35}
        fitContent={flowStep !== "taskSplit"}
        closeOnOverlayClick={!(flowStep === "ai" && aiArrangeMutation.isPending)}
        enableDragHandle={flowStep === "taskSplit"}
        sheetClassName={flowStep === "taskSplit" ? "max-h-[80vh] overflow-y-auto" : undefined}
        className="pb-[env(safe-area-inset-bottom)]"
      >
        {flowStep === "ai" ? (
          <AiArrangeSheetContent
            isPending={aiArrangeMutation.isPending}
            canArrange={Boolean(dayPlanId) && (aiUsageRemainingCount ?? 1) > 0}
            onArrange={handleAiArrange}
            onCancel={handleAiCancel}
            aiUsageRemainingCount={aiUsageRemainingCount}
          />
        ) : null}
        {flowStep === "taskSplit" ? (
          <TaskSplitSheetContent
            groups={splitGroups}
            onAddItem={handleAddSplitItem}
            onChangeItem={handleChangeSplitItem}
            onRemoveItem={handleRemoveSplitItem}
            onSubmit={handleTaskSplitSubmit}
            isSubmitting={scheduleChildrenMutation.isPending}
          />
        ) : null}
        {flowStep === "loading" ? (
          <div className="px-6 py-10 text-center text-sm text-neutral-400">
            상태를 확인하는 중...
          </div>
        ) : null}
      </BottomSheet>

      <TaskBasketAddSheet
        open={isSheetOpen}
        onOpenChange={handleSheetOpenChange}
        tasks={tasks}
        dayPlanId={dayPlanId}
        invalidateKeys={invalidateScheduleKeys}
        onAddTask={(task) => setTasks((prev) => [task, ...prev])}
        editingTask={editingTask}
        onUpdateTask={handleUpdateTask}
      />
    </>
  );
}
