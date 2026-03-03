"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  TASK_BASKET_LONG_DURATION_VALUES,
  TASK_BASKET_OVER_FOUR_HOURS_VALUES,
  TASK_BASKET_SPLIT_ITEM_PLACEHOLDER,
  TASK_BASKET_SPLIT_MIN_ITEMS_DEFAULT,
  TASK_BASKET_SPLIT_MIN_ITEMS_OVER_FOUR_HOURS,
} from "./constants";
import type {
  TaskBasketFlowStep,
  TaskBasketSplitGroup,
  TaskBasketSplitItem,
  TaskBasketTodoTask,
} from "./types";

interface TaskSplitSchedulePayload {
  parentScheduleId: number;
  titles: string[];
}

interface UseTaskBasketFlowParams {
  tasks: TaskBasketTodoTask[];
  isScheduleLoading: boolean;
  isAiArrangePending: boolean;
}

const createTaskSplitItem = (id: TaskBasketSplitItem["id"]): TaskBasketSplitItem => ({
  id,
  value: "",
  placeholder: TASK_BASKET_SPLIT_ITEM_PLACEHOLDER,
});

const getMinItemsByDuration = (duration?: string | null) =>
  TASK_BASKET_OVER_FOUR_HOURS_VALUES.has(duration ?? "")
    ? TASK_BASKET_SPLIT_MIN_ITEMS_OVER_FOUR_HOURS
    : TASK_BASKET_SPLIT_MIN_ITEMS_DEFAULT;

const buildTaskSplitGroups = (items: TaskBasketTodoTask[]): TaskBasketSplitGroup[] =>
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

export function useTaskBasketFlow({
  tasks,
  isScheduleLoading,
  isAiArrangePending,
}: UseTaskBasketFlowParams) {
  const [flowStep, setFlowStep] = useState<TaskBasketFlowStep>("idle");
  const [aiPromptHandled, setAiPromptHandled] = useState(false);
  const [taskSplitHandled, setTaskSplitHandled] = useState(false);
  const [aiArrangeError, setAiArrangeError] = useState(false);
  const [splitGroups, setSplitGroups] = useState<TaskBasketSplitGroup[]>([]);
  const [splitGroupsKey, setSplitGroupsKey] = useState("");

  const taskSplitCandidates = useMemo(
    () =>
      tasks.filter((task) => TASK_BASKET_LONG_DURATION_VALUES.has(task.estimatedTimeRange ?? "")),
    [tasks],
  );
  const hasFlexTask = useMemo(() => tasks.some((task) => task.type === "FLEX"), [tasks]);
  const shouldShowAiPrompt = hasFlexTask;
  const shouldShowTaskSplitPrompt = taskSplitCandidates.length > 0;
  const flowSignature = useMemo(
    () =>
      `${tasks.length}:${hasFlexTask}:${taskSplitCandidates
        .map((task) => task.scheduleId)
        .join(",")}`,
    [hasFlexTask, taskSplitCandidates, tasks.length],
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
    if (isScheduleLoading) return;
    if (shouldShowTaskSplitStep) {
      setFlowStep("taskSplit");
      return;
    }
    if (shouldShowAiStep) {
      setFlowStep("ai");
      return;
    }
    setFlowStep("idle");
  }, [flowStep, isScheduleLoading, shouldShowAiStep, shouldShowTaskSplitStep]);

  useEffect(() => {
    if (flowStep !== "taskSplit") return;
    if (!shouldShowTaskSplitStep) return;
    const nextKey = taskSplitCandidates.map((task) => task.scheduleId).join(",");
    if (splitGroupsKey === nextKey) return;
    setSplitGroups(buildTaskSplitGroups(taskSplitCandidates));
    setSplitGroupsKey(nextKey);
  }, [flowStep, shouldShowTaskSplitStep, splitGroupsKey, taskSplitCandidates]);

  const handleAiArrangeSucceeded = useCallback(() => {
    setAiPromptHandled(true);
    setAiArrangeError(false);
    setFlowStep("loading");
  }, []);

  const handleAiArrangeFailed = useCallback(() => {
    setAiPromptHandled(false);
    setAiArrangeError(true);
    setFlowStep(shouldShowTaskSplitStep ? "taskSplit" : "idle");
  }, [shouldShowTaskSplitStep]);

  const handleAiCancel = useCallback(() => {
    setAiPromptHandled(false);
    setAiArrangeError(false);
    setTaskSplitHandled(true);
    setFlowStep("idle");
  }, []);

  const handleTaskSplitSucceeded = useCallback(() => {
    setTaskSplitHandled(true);
    setFlowStep("idle");
  }, []);

  const handleFlowOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        if (flowStep === "ai" && isAiArrangePending) return;
        if (flowStep === "ai") setAiPromptHandled(false);
        if (flowStep === "taskSplit") setTaskSplitHandled(true);
        setAiArrangeError(false);
        setFlowStep("idle");
      }
    },
    [flowStep, isAiArrangePending],
  );

  const buildTaskSplitSubmitPayload = useCallback(() => {
    const schedules = splitGroups
      .map((group) => {
        const parentScheduleId = Number(group.id);
        if (Number.isNaN(parentScheduleId)) return null;
        const titles = group.items.map((item) => item.value.trim()).filter(Boolean);
        if (titles.length === 0) return null;
        return { parentScheduleId, titles };
      })
      .filter((item): item is TaskSplitSchedulePayload => item !== null);

    if (schedules.length === 0) return null;
    return { schedules };
  }, [splitGroups]);

  const handleAddSplitItem = useCallback((groupId: TaskBasketSplitGroup["id"]) => {
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
  }, []);

  const handleChangeSplitItem = useCallback(
    (groupId: TaskBasketSplitGroup["id"], itemId: TaskBasketSplitItem["id"], value: string) => {
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
    },
    [],
  );

  const handleRemoveSplitItem = useCallback(
    (groupId: TaskBasketSplitGroup["id"], itemId: TaskBasketSplitItem["id"]) => {
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
    },
    [],
  );

  const handleOpenFlowSheet = useCallback(() => {
    if (flowStep !== "idle") return;
    if (isScheduleLoading) {
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
  }, [flowStep, isScheduleLoading, shouldShowAiStep, shouldShowTaskSplitStep]);

  return {
    flowStep,
    splitGroups,
    shouldShowTaskSplitStep,
    handleAiArrangeSucceeded,
    handleAiArrangeFailed,
    handleAiCancel,
    handleTaskSplitSucceeded,
    handleFlowOpenChange,
    buildTaskSplitSubmitPayload,
    handleAddSplitItem,
    handleChangeSplitItem,
    handleRemoveSplitItem,
    handleOpenFlowSheet,
  };
}
