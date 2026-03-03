"use client";

import { useCallback } from "react";

import type {
  useAiArrangeScheduleMutation,
  useDeleteScheduleMutation,
  useScheduleChildrenMutation,
} from "../../model/useScheduleMutations";
import { ApiError } from "@/shared/api";
import type { ToastType } from "@/shared/ui/toast";
import {
  TASK_BASKET_AI_ARRANGE_EXHAUSTED_MESSAGE,
  TASK_BASKET_AI_ARRANGE_SUCCESS_MESSAGE,
} from "./constants";

interface TaskSplitSubmitPayload {
  schedules: Array<{
    parentScheduleId: number;
    titles: string[];
  }>;
}

interface UseTaskBasketActionHandlersParams {
  dayPlanId: number | null;
  deleteTargetId: number | null;
  showToast: (message: string, type?: ToastType) => void;
  pop: () => void;
  deleteScheduleMutation: ReturnType<typeof useDeleteScheduleMutation>;
  aiArrangeMutation: ReturnType<typeof useAiArrangeScheduleMutation>;
  scheduleChildrenMutation: ReturnType<typeof useScheduleChildrenMutation>;
  buildTaskSplitSubmitPayload: () => TaskSplitSubmitPayload | null;
  handleTaskSplitSucceeded: () => void;
  handleAiArrangeSucceeded: () => void;
  handleAiArrangeFailed: () => void;
  onDeleteSuccess: (scheduleId: number) => void;
}

export function useTaskBasketActionHandlers({
  dayPlanId,
  deleteTargetId,
  showToast,
  pop,
  deleteScheduleMutation,
  aiArrangeMutation,
  scheduleChildrenMutation,
  buildTaskSplitSubmitPayload,
  handleTaskSplitSucceeded,
  handleAiArrangeSucceeded,
  handleAiArrangeFailed,
  onDeleteSuccess,
}: UseTaskBasketActionHandlersParams) {
  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTargetId) return;
    deleteScheduleMutation.mutate(deleteTargetId, {
      onSuccess: () => {
        onDeleteSuccess(deleteTargetId);
      },
    });
  }, [deleteScheduleMutation, deleteTargetId, onDeleteSuccess]);

  const handleTaskSplitSubmit = useCallback(() => {
    if (scheduleChildrenMutation.isPending) return;
    const payload = buildTaskSplitSubmitPayload();
    if (!payload) return;
    scheduleChildrenMutation.mutate(payload, {
      onSuccess: () => {
        handleTaskSplitSucceeded();
      },
    });
  }, [buildTaskSplitSubmitPayload, handleTaskSplitSucceeded, scheduleChildrenMutation]);

  const handleAiArrange = useCallback(() => {
    if (!dayPlanId || aiArrangeMutation.isPending) return;
    aiArrangeMutation.mutate(undefined, {
      onSuccess: () => {
        showToast(TASK_BASKET_AI_ARRANGE_SUCCESS_MESSAGE, "success");
        handleAiArrangeSucceeded();
        pop();
      },
      onError: (error) => {
        if (error instanceof ApiError && error.httpStatus === 400) {
          showToast(error.message || TASK_BASKET_AI_ARRANGE_EXHAUSTED_MESSAGE, "error");
        }
        handleAiArrangeFailed();
      },
    });
  }, [
    aiArrangeMutation,
    dayPlanId,
    handleAiArrangeFailed,
    handleAiArrangeSucceeded,
    pop,
    showToast,
  ]);

  return {
    handleDeleteConfirm,
    handleTaskSplitSubmit,
    handleAiArrange,
  };
}
