"use client";

import { useCallback, useEffect } from "react";

import {
  useTaskBasketActionHandlers,
  useTaskBasketFlowMutations,
  useTaskBasketScheduleListQuery,
} from "@/features/home";
import { useHomePlanStore } from "@/entities/day-plan";
import { useToast } from "@/shared/ui/toast";
import { useStackPage } from "@/widgets/stack";
import { useTaskBasketFlow } from "@/widgets/task-basket";
import { useTaskBasketHeaderEffect } from "./useTaskBasketHeaderEffect";
import { useTaskBasketUiState } from "./useTaskBasketUiState";

export function useTaskBasketStackPageModel() {
  const { setHeaderContent, pop } = useStackPage();
  const { showToast } = useToast();
  const dayPlanId = useHomePlanStore((state) => state.dayPlanId);
  const dayPlanDate = useHomePlanStore((state) => state.date);
  const aiUsageRemainingCount = useHomePlanStore((state) => state.aiUsageRemainingCount);
  const setAiUsageRemainingCount = useHomePlanStore((state) => state.setAiUsageRemainingCount);

  const {
    isSheetOpen,
    editingTask,
    tasks,
    isDeleteDialogOpen,
    deleteTargetId,
    handleOpenSheet,
    handleEditTask,
    handleDeleteRequest,
    handleDeleteDialogOpenChange,
    handleSheetOpenChange,
    handleUpdateTask,
    removeTaskFromLocal,
    closeDeleteDialog,
  } = useTaskBasketUiState();

  const {
    contentRef,
    scrollRootRef,
    selectedDate,
    invalidateScheduleKeys,
    mergedTasks,
    hasMore,
    isFetchingMore,
    isScheduleLoading,
    scheduleData,
    handleLoadMore,
    removeFetchedTask,
  } = useTaskBasketScheduleListQuery({
    dayPlanId,
    dayPlanDate,
    localTasks: tasks,
  });

  const { deleteScheduleMutation, aiArrangeMutation, scheduleChildrenMutation } =
    useTaskBasketFlowMutations({
      dayPlanId,
      invalidateScheduleKeys,
    });

  useTaskBasketHeaderEffect({ setHeaderContent });

  useEffect(() => {
    if (!scheduleData) return;
    const nextCount = scheduleData.aiUsageRemainingCount ?? null;
    setAiUsageRemainingCount(nextCount);
  }, [scheduleData, setAiUsageRemainingCount]);

  const {
    flowStep,
    splitGroups,
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
  } = useTaskBasketFlow({
    tasks: mergedTasks,
    isScheduleLoading,
    isAiArrangePending: aiArrangeMutation.isPending,
  });

  const handleDeleteSuccess = useCallback(
    (scheduleId: number) => {
      removeTaskFromLocal(scheduleId);
      removeFetchedTask(scheduleId);
      closeDeleteDialog();
    },
    [closeDeleteDialog, removeFetchedTask, removeTaskFromLocal],
  );

  const { handleDeleteConfirm, handleTaskSplitSubmit, handleAiArrange } =
    useTaskBasketActionHandlers({
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
      onDeleteSuccess: handleDeleteSuccess,
    });

  return {
    contentRef,
    scrollRootRef,
    dayPlanId,
    invalidateScheduleKeys,
    selectedDate,
    mergedTasks,
    hasMore,
    isFetchingMore,
    isSheetOpen,
    editingTask,
    isDeleteDialogOpen,
    deleteSchedulePending: deleteScheduleMutation.isPending,
    flowStep,
    splitGroups,
    taskSplitSubmitting: scheduleChildrenMutation.isPending,
    aiArrangePending: aiArrangeMutation.isPending,
    aiArrangeEnabled: Boolean(dayPlanId) && (aiUsageRemainingCount ?? 1) > 0,
    aiUsageRemainingCount,
    handleOpenSheet,
    handleEditTask,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleDeleteDialogOpenChange,
    handleSheetOpenChange,
    handleUpdateTask,
    handleLoadMore,
    handleOpenFlowSheet,
    handleFlowOpenChange,
    handleAiArrange,
    handleAiCancel,
    handleTaskSplitSubmit,
    handleAddSplitItem,
    handleChangeSplitItem,
    handleRemoveSplitItem,
  };
}
