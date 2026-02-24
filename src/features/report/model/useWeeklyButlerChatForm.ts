import { useState } from "react";

import { useToast } from "@/shared/ui/toast";

import { WEEKLY_BUTLER_CHAT_MAX_SEND_COUNT } from "./weeklyButler.constants";
import { toWeeklyButlerChatRequestDto } from "./weeklyButlerChat.dto";
import {
  isWeeklyButlerChatLimitReached,
  isWeeklyButlerChatSendable,
} from "./weeklyButlerChat.schema";
import { useWeeklyButlerSendMockMutation } from "./useWeeklyButlerSendMockMutation";

import type { WeeklyButlerChatFormModel } from "./weeklyButlerChat.types";

const TOAST_BLANK_MESSAGE = "메시지를 입력해주세요.";
const TOAST_SEND_FAILURE_MESSAGE = "응답 생성에 실패했습니다.";

export function useWeeklyButlerChatForm() {
  const [form, setForm] = useState<WeeklyButlerChatFormModel>({ message: "" });
  const [sentCount, setSentCount] = useState(0);
  const { showToast } = useToast();
  const mutation = useWeeklyButlerSendMockMutation();

  const isLimitReached = isWeeklyButlerChatLimitReached(sentCount);
  const remainingCount = WEEKLY_BUTLER_CHAT_MAX_SEND_COUNT - sentCount;

  const handleChange = (message: string) => {
    setForm({ message });
  };

  const handleSend = async () => {
    if (!isWeeklyButlerChatSendable(form)) {
      showToast(TOAST_BLANK_MESSAGE, "error");
      return;
    }

    const dto = toWeeklyButlerChatRequestDto(form);

    try {
      await mutation.mutateAsync(dto);
      setForm({ message: "" });
      setSentCount((prev) => prev + 1);
    } catch {
      showToast(TOAST_SEND_FAILURE_MESSAGE, "error");
    }
  };

  return {
    message: form.message,
    isSendDisabled: !isWeeklyButlerChatSendable(form) || mutation.isPending,
    isSendHidden: isLimitReached,
    isPending: mutation.isPending,
    sentCount,
    remainingCount,
    handleChange,
    handleSend,
  };
}
