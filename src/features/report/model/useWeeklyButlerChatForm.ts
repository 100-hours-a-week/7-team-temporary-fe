import { useState } from "react";

import { useToast } from "@/shared/ui/toast";

import { WEEKLY_BUTLER_CHAT_MAX_SEND_COUNT } from "./weeklyButler.constants";
import { toWeeklyButlerChatRequestDto } from "./weeklyButlerChat.dto";
import {
  isWeeklyButlerChatLimitReached,
  isWeeklyButlerChatSendable,
} from "./weeklyButlerChat.schema";
import { useWeeklyButlerSendMutation } from "./useWeeklyButlerSendMutation";

import type { WeeklyButlerChatFormModel } from "./weeklyButlerChat.types";

const TOAST_BLANK_MESSAGE = "메시지를 입력해주세요.";
const TOAST_SEND_FAILURE_MESSAGE = "응답 생성에 실패했습니다.";
const TOAST_REPORT_NOT_READY_MESSAGE =
  "리포트 정보를 불러오는 중이에요. 잠시 후 다시 시도해주세요.";
const TOAST_NOT_LAST_WEEK_MESSAGE = "지난주 리포트에서만 햄찌와 대화할 수 있어요.";

interface UseWeeklyButlerChatFormOptions {
  reportId?: number | null;
  aiReportResponseLimit?: number | null;
  aiReportResponseUsed?: number | null;
  isInputEnabled?: boolean;
  onSendOptimistic?: (message: string) => void;
  onSendRollback?: () => void;
}

export function useWeeklyButlerChatForm({
  reportId,
  aiReportResponseLimit,
  aiReportResponseUsed,
  isInputEnabled = true,
  onSendOptimistic,
  onSendRollback,
}: UseWeeklyButlerChatFormOptions = {}) {
  const [form, setForm] = useState<WeeklyButlerChatFormModel>({ message: "" });
  const [localSentCount, setLocalSentCount] = useState(0);
  const { showToast } = useToast();
  const mutation = useWeeklyButlerSendMutation();

  const maxSendCount = WEEKLY_BUTLER_CHAT_MAX_SEND_COUNT;
  const baseRemainingCount = Math.max(
    0,
    aiReportResponseLimit ?? Math.max(0, maxSendCount - Math.max(0, aiReportResponseUsed ?? 0)),
  );
  const remainingCount = Math.max(0, baseRemainingCount - localSentCount);
  const sentCount = Math.max(0, maxSendCount - remainingCount);

  const isLimitReached =
    remainingCount <= 0 || isWeeklyButlerChatLimitReached(sentCount, maxSendCount);
  const isReportReady = typeof reportId === "number" && reportId > 0;
  const isInputDisabled = !isInputEnabled || !isReportReady || isLimitReached || mutation.isPending;

  const handleChange = (message: string) => {
    if (isInputDisabled) return;
    setForm({ message });
  };

  const handleSend = async () => {
    if (!isInputEnabled) {
      showToast(TOAST_NOT_LAST_WEEK_MESSAGE, "error");
      return;
    }

    if (isLimitReached) return;

    if (!isWeeklyButlerChatSendable(form)) {
      showToast(TOAST_BLANK_MESSAGE, "error");
      return;
    }

    if (typeof reportId !== "number" || reportId <= 0) {
      showToast(TOAST_REPORT_NOT_READY_MESSAGE, "error");
      return;
    }

    const dto = toWeeklyButlerChatRequestDto(form, reportId);
    onSendOptimistic?.(dto.inputMessage);

    try {
      await mutation.mutateAsync(dto);
      setForm({ message: "" });
      setLocalSentCount((prev) => prev + 1);
    } catch {
      onSendRollback?.();
      showToast(TOAST_SEND_FAILURE_MESSAGE, "error");
    }
  };

  return {
    message: form.message,
    maxSendCount,
    isSendDisabled:
      !isInputEnabled ||
      !isReportReady ||
      isLimitReached ||
      !isWeeklyButlerChatSendable(form) ||
      mutation.isPending,
    isInputDisabled,
    isSendHidden: isLimitReached,
    isPending: mutation.isPending,
    sentCount,
    remainingCount,
    handleChange,
    handleSend,
  };
}
