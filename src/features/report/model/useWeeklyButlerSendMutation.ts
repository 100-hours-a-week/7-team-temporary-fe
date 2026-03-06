"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reportQueryKeys } from "@/entities/report";
import { chatStompSession } from "@/shared/socket";

import type { WeeklyButlerChatRequestDto } from "./weeklyButlerChat.types";

export function useWeeklyButlerSendMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: WeeklyButlerChatRequestDto): Promise<void> => {
      await chatStompSession.sendReportMessage({
        reportId: dto.reportId,
        inputMessage: dto.inputMessage,
      });
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: reportQueryKeys.messagesAll(variables.reportId),
      });
      void queryClient.invalidateQueries({ queryKey: reportQueryKeys.all });
    },
  });
}
