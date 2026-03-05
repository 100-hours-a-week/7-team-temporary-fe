import { useEffect, useMemo, useRef, useState } from "react";

import { SectionCard } from "@/shared/ui";
import { useReportMessagesInfiniteQuery } from "@/entities/report";
import type { ReportMessageItemVM } from "@/entities/report";
import { reportQueryKeys } from "@/entities/report";
import { useQueryClient } from "@tanstack/react-query";
import { chatStompSession } from "@/shared/socket";

import {
  WEEKLY_BUTLER_CHAT_MAX_HEIGHT_PX,
  WEEKLY_BUTLER_CHAT_MIN_HEIGHT_PX,
  WEEKLY_BUTLER_CHAT_INPUT_MAX_LENGTH,
  WEEKLY_BUTLER_CHAT_INPUT_PLACEHOLDER,
  WEEKLY_BUTLER_CHAT_LIMIT_REACHED_PLACEHOLDER,
  WEEKLY_BUTLER_CHAT_WEEK_DISABLED_PLACEHOLDER,
  WEEKLY_BUTLER_GREETING_LINES,
  WEEKLY_BUTLER_QUICK_ACTIONS,
} from "../model/weeklyButler.constants";
import { useWeeklyButlerChatForm } from "../model/useWeeklyButlerChatForm";
import { WeeklyButlerAvatar, WeeklyButlerBotBubble } from "./WeeklyButlerBubble";
import { WeeklyButlerChatComposer } from "./WeeklyButlerChatComposer";
import { WeeklyButlerHero } from "./WeeklyButlerHero";
import { WeeklyButlerMessageHistory } from "./WeeklyButlerMessageHistory";
import { WeeklyButlerQuickActions } from "./WeeklyButlerQuickActions";

interface WeeklyButlerSectionProps {
  reportId?: number | null;
  aiReportResponseLimit?: number | null;
  aiReportResponseUsed?: number | null;
  isInputEnabled?: boolean;
}

const STREAM_TYPING_INTERVAL_MS = 36;

function isPlaceholderContent(content: string | null | undefined) {
  if (typeof content !== "string") return false;
  const compact = content.trim().replace(/[()\s.,!?]/g, "");
  return compact === "내용없음";
}

export function WeeklyButlerSection({
  reportId,
  aiReportResponseLimit,
  aiReportResponseUsed,
  isInputEnabled = true,
}: WeeklyButlerSectionProps) {
  const queryClient = useQueryClient();
  const [optimisticMessages, setOptimisticMessages] = useState<ReportMessageItemVM[]>([]);
  const [liveCreatedMessages, setLiveCreatedMessages] = useState<
    Record<number, ReportMessageItemVM>
  >({});
  const [streamingMessages, setStreamingMessages] = useState<Record<number, ReportMessageItemVM>>(
    {},
  );
  const [isWaitingForStreamStart, setIsWaitingForStreamStart] = useState(false);
  const nextOptimisticIdRef = useRef(-1);
  const sequenceByMessageIdRef = useRef(new Map<number, number>());
  const startedStreamMessageIdsRef = useRef(new Set<number>());
  const pendingDeltaByMessageIdRef = useRef(new Map<number, string>());
  const streamMetaByMessageIdRef = useRef(
    new Map<
      number,
      {
        senderType: ReportMessageItemVM["senderType"];
        messageType: ReportMessageItemVM["messageType"];
      }
    >(),
  );
  const streamSyncTimerRef = useRef<number | null>(null);
  const streamTypingTimerRef = useRef<number | null>(null);
  const messageLogScrollRef = useRef<HTMLDivElement | null>(null);

  const finalizeStreamingMessage = (messageId: number, finalContent?: string | null) => {
    startedStreamMessageIdsRef.current.delete(messageId);
    sequenceByMessageIdRef.current.delete(messageId);
    pendingDeltaByMessageIdRef.current.delete(messageId);
    streamMetaByMessageIdRef.current.delete(messageId);

    setStreamingMessages((prev) => {
      if (!(messageId in prev)) return prev;
      const next = { ...prev };
      delete next[messageId];
      return next;
    });

    if (
      typeof finalContent === "string" &&
      finalContent.length > 0 &&
      !isPlaceholderContent(finalContent)
    ) {
      setLiveCreatedMessages((prev) => {
        const current = prev[messageId];
        if (!current) return prev;
        return {
          ...prev,
          [messageId]: {
            ...current,
            content: finalContent,
          },
        };
      });
    }
  };

  const startStreamTypingLoop = () => {
    if (streamTypingTimerRef.current !== null) return;

    streamTypingTimerRef.current = window.setInterval(() => {
      const targetEntry = Array.from(pendingDeltaByMessageIdRef.current.entries()).find(
        ([, pendingDelta]) => pendingDelta.length > 0,
      );

      if (!targetEntry) {
        if (streamTypingTimerRef.current !== null) {
          window.clearInterval(streamTypingTimerRef.current);
          streamTypingTimerRef.current = null;
        }
        return;
      }

      const [messageId, pendingDelta] = targetEntry;
      const nextChar = pendingDelta.slice(0, 1);
      const rest = pendingDelta.slice(1);

      if (rest.length === 0) {
        pendingDeltaByMessageIdRef.current.delete(messageId);
      } else {
        pendingDeltaByMessageIdRef.current.set(messageId, rest);
      }

      const streamMeta = streamMetaByMessageIdRef.current.get(messageId);
      if (!streamMeta) return;

      setStreamingMessages((prev) => {
        const current = prev[messageId];
        return {
          ...prev,
          [messageId]: {
            messageId,
            senderType: streamMeta.senderType,
            messageType: streamMeta.messageType,
            content: `${current?.content ?? ""}${nextChar}`,
            sentAt: current?.sentAt ?? new Date().toISOString(),
          },
        };
      });

      setLiveCreatedMessages((prev) => {
        const current = prev[messageId];
        return {
          ...prev,
          [messageId]: {
            messageId,
            senderType: streamMeta.senderType,
            messageType: streamMeta.messageType,
            content: `${current?.content ?? ""}${nextChar}`,
            sentAt: current?.sentAt ?? new Date().toISOString(),
          },
        };
      });
    }, STREAM_TYPING_INTERVAL_MS);
  };

  const addOptimisticMessage = (nextMessage: string) => {
    const tempMessage: ReportMessageItemVM = {
      messageId: nextOptimisticIdRef.current,
      senderType: "USER",
      messageType: "TEXT",
      content: nextMessage,
      sentAt: new Date().toISOString(),
    };
    nextOptimisticIdRef.current -= 1;
    setOptimisticMessages((prev) => [...prev, tempMessage]);
    setIsWaitingForStreamStart(true);
  };

  const rollbackOptimisticMessage = () => {
    setOptimisticMessages((prev) => prev.slice(0, -1));
    setIsWaitingForStreamStart(false);
  };

  const {
    message,
    maxSendCount,
    remainingCount,
    isInputDisabled,
    isSendDisabled,
    isSendHidden,
    handleChange,
    handleSend,
  } = useWeeklyButlerChatForm({
    reportId,
    aiReportResponseLimit,
    aiReportResponseUsed,
    isInputEnabled,
    onSendOptimistic: addOptimisticMessage,
    onSendRollback: rollbackOptimisticMessage,
  });
  const reportMessagesQuery = useReportMessagesInfiniteQuery({
    reportId: reportId ?? 0,
    enabled: typeof reportId === "number" && reportId > 0,
  });

  useEffect(() => {
    setOptimisticMessages([]);
    setLiveCreatedMessages({});
    setStreamingMessages({});
    setIsWaitingForStreamStart(false);
    sequenceByMessageIdRef.current = new Map();
    startedStreamMessageIdsRef.current = new Set();
    pendingDeltaByMessageIdRef.current = new Map();
    streamMetaByMessageIdRef.current = new Map();
    if (streamTypingTimerRef.current !== null) {
      window.clearInterval(streamTypingTimerRef.current);
      streamTypingTimerRef.current = null;
    }
  }, [reportId]);

  useEffect(() => {
    if (typeof reportId !== "number" || reportId <= 0) return;
    return chatStompSession.onReportMessageSendAccepted((payload) => {
      if (payload.reportId !== reportId) return;
      setOptimisticMessages((prev) => prev.slice(1));
    });
  }, [reportId]);

  useEffect(() => {
    if (typeof reportId !== "number" || reportId <= 0) return;
    return chatStompSession.onReportMessageCreated((payload) => {
      if (payload.reportId !== reportId) return;

      setLiveCreatedMessages((prev) => {
        const current = prev[payload.messageId];
        const incomingContent = payload.content ?? "";
        const shouldKeepCurrentContent =
          typeof current?.content === "string" &&
          current.content.length > 0 &&
          (incomingContent.length === 0 || isPlaceholderContent(incomingContent));

        const nextMessage: ReportMessageItemVM = {
          messageId: payload.messageId,
          senderType: payload.senderType,
          messageType: payload.messageType,
          content: shouldKeepCurrentContent ? current.content : incomingContent,
          sentAt: payload.sentAt,
        };

        return {
          ...prev,
          [payload.messageId]: nextMessage,
        };
      });

      // message.created(특히 AI)는 스트림 완료 상태로 본다.
      if (startedStreamMessageIdsRef.current.has(payload.messageId)) {
        finalizeStreamingMessage(payload.messageId, payload.content);
      }
    });
  }, [reportId]);

  useEffect(() => {
    if (typeof reportId !== "number" || reportId <= 0) return;
    return chatStompSession.onReportStreamStart((payload) => {
      if (payload.reportId !== reportId) return;
      startedStreamMessageIdsRef.current.add(payload.messageId);
      streamMetaByMessageIdRef.current.set(payload.messageId, {
        senderType: payload.senderType,
        messageType: payload.messageType,
      });
      setLiveCreatedMessages((prev) => ({
        ...prev,
        [payload.messageId]: {
          messageId: payload.messageId,
          senderType: payload.senderType,
          messageType: payload.messageType,
          content: prev[payload.messageId]?.content ?? "",
          sentAt: prev[payload.messageId]?.sentAt ?? new Date().toISOString(),
        },
      }));
      setIsWaitingForStreamStart(false);
    });
  }, [reportId]);

  useEffect(() => {
    if (typeof reportId !== "number" || reportId <= 0) return;
    return chatStompSession.onReportStreamEnd((payload) => {
      if (payload.reportId !== reportId) return;
      finalizeStreamingMessage(payload.messageId, payload.content);
    });
  }, [reportId]);

  useEffect(() => {
    if (typeof reportId !== "number" || reportId <= 0) return;

    return chatStompSession.onReportStreamChunk((payload) => {
      if (payload.reportId !== reportId) return;
      if (!startedStreamMessageIdsRef.current.has(payload.messageId)) return;

      const previousSequence = sequenceByMessageIdRef.current.get(payload.messageId) ?? 0;
      if (payload.sequence <= previousSequence) return;
      sequenceByMessageIdRef.current.set(payload.messageId, payload.sequence);
      streamMetaByMessageIdRef.current.set(payload.messageId, {
        senderType: payload.senderType,
        messageType: payload.messageType,
      });

      const currentPendingDelta = pendingDeltaByMessageIdRef.current.get(payload.messageId) ?? "";
      pendingDeltaByMessageIdRef.current.set(
        payload.messageId,
        `${currentPendingDelta}${payload.delta}`,
      );
      startStreamTypingLoop();

      if (streamSyncTimerRef.current !== null) {
        window.clearTimeout(streamSyncTimerRef.current);
      }
      streamSyncTimerRef.current = window.setTimeout(() => {
        streamSyncTimerRef.current = null;
        void queryClient.invalidateQueries({
          queryKey: reportQueryKeys.messagesAll(reportId),
        });
      }, 700);
    });
  }, [queryClient, reportId]);

  useEffect(() => {
    if (reportMessagesQuery.messages.length === 0) return;

    const messageById = new Map(reportMessagesQuery.messages.map((item) => [item.messageId, item]));

    setLiveCreatedMessages((prev) => {
      let isChanged = false;
      const next = { ...prev };

      Object.keys(prev).forEach((rawKey) => {
        const messageId = Number(rawKey);
        const liveMessage = prev[messageId];
        const syncedMessage = messageById.get(messageId);
        if (!liveMessage || !syncedMessage) return;

        const syncedContent = syncedMessage.content ?? "";
        const liveContent = liveMessage.content ?? "";
        if (isPlaceholderContent(syncedContent)) return;
        if (syncedContent.length < liveContent.length) return;

        delete next[messageId];
        isChanged = true;
      });

      return isChanged ? next : prev;
    });

    setStreamingMessages((prev) => {
      let isChanged = false;
      const next = { ...prev };

      Object.values(prev).forEach((streamingMessage) => {
        const syncedMessage = messageById.get(streamingMessage.messageId);
        if (!syncedMessage) return;
        const pendingDelta =
          pendingDeltaByMessageIdRef.current.get(streamingMessage.messageId) ?? "";
        if (pendingDelta.length > 0) return;

        const syncedContentLength = syncedMessage.content?.length ?? 0;
        const streamingContentLength = streamingMessage.content?.length ?? 0;
        if (syncedContentLength < streamingContentLength) return;

        delete next[streamingMessage.messageId];
        sequenceByMessageIdRef.current.delete(streamingMessage.messageId);
        startedStreamMessageIdsRef.current.delete(streamingMessage.messageId);
        pendingDeltaByMessageIdRef.current.delete(streamingMessage.messageId);
        streamMetaByMessageIdRef.current.delete(streamingMessage.messageId);
        isChanged = true;
      });

      return isChanged ? next : prev;
    });
  }, [reportMessagesQuery.messages]);

  useEffect(() => {
    return () => {
      if (streamSyncTimerRef.current !== null) {
        window.clearTimeout(streamSyncTimerRef.current);
      }
      if (streamTypingTimerRef.current !== null) {
        window.clearInterval(streamTypingTimerRef.current);
      }
    };
  }, []);

  const mergedMessages = useMemo(() => {
    const byMessageId = new Map<number, ReportMessageItemVM>();
    reportMessagesQuery.messages.forEach((item) => byMessageId.set(item.messageId, item));

    Object.values(liveCreatedMessages).forEach((item) => {
      byMessageId.set(item.messageId, item);
    });

    Object.values(streamingMessages).forEach((item) => {
      const current = byMessageId.get(item.messageId);
      byMessageId.set(item.messageId, {
        ...(current ?? item),
        ...item,
        content: item.content,
      });
    });

    optimisticMessages.forEach((item) => {
      byMessageId.set(item.messageId, item);
    });

    return Array.from(byMessageId.values()).sort((left, right) => {
      const leftTime = new Date(left.sentAt).getTime();
      const rightTime = new Date(right.sentAt).getTime();
      if (leftTime === rightTime) return left.messageId - right.messageId;
      return leftTime - rightTime;
    });
  }, [liveCreatedMessages, optimisticMessages, reportMessagesQuery.messages, streamingMessages]);

  const latestRenderKey = useMemo(() => {
    const latestMessage = mergedMessages[mergedMessages.length - 1];
    if (!latestMessage) return isWaitingForStreamStart ? "waiting" : "empty";
    return `${latestMessage.messageId}:${latestMessage.content}:${isWaitingForStreamStart ? "waiting" : "ready"}`;
  }, [isWaitingForStreamStart, mergedMessages]);

  const placeholder = !isInputEnabled
    ? WEEKLY_BUTLER_CHAT_WEEK_DISABLED_PLACEHOLDER
    : isSendHidden
      ? `${WEEKLY_BUTLER_CHAT_LIMIT_REACHED_PLACEHOLDER} (남은 0/${maxSendCount}회)`
      : `${WEEKLY_BUTLER_CHAT_INPUT_PLACEHOLDER} (남은 ${remainingCount}/${maxSendCount}회)`;

  useEffect(() => {
    if (!latestRenderKey) return;
    const target = messageLogScrollRef.current;
    if (!target) return;

    const rafId = window.requestAnimationFrame(() => {
      target.scrollTop = target.scrollHeight;
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [latestRenderKey]);

  return (
    <section className="mt-4">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-black">이번주 레포트</h2>
        <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-semibold text-neutral-500">
          🐹 햄스터 버틀러
        </span>
      </div>

      <SectionCard className="mt-3 p-4">
        <div className="mt-4 overflow-hidden rounded-2xl">
          <div
            ref={messageLogScrollRef}
            className="scrollbar-hide space-y-3 overflow-y-auto px-3 pt-3"
            style={{
              minHeight: WEEKLY_BUTLER_CHAT_MIN_HEIGHT_PX,
              maxHeight: WEEKLY_BUTLER_CHAT_MAX_HEIGHT_PX,
            }}
            role="log"
            aria-label="햄스터 버틀러 대화"
          >
            <WeeklyButlerHero />
            <div className="flex items-end gap-2">
              <WeeklyButlerAvatar
                emoji="🐹"
                className="mb-1"
              />
              <WeeklyButlerBotBubble>
                {WEEKLY_BUTLER_GREETING_LINES.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </WeeklyButlerBotBubble>
            </div>

            <WeeklyButlerQuickActions
              actions={WEEKLY_BUTLER_QUICK_ACTIONS}
              disabled={isInputDisabled}
              onActionClick={handleChange}
            />

            <WeeklyButlerMessageHistory
              messages={mergedMessages}
              isLoading={reportMessagesQuery.isLoading}
              isError={reportMessagesQuery.isError}
              hasMore={reportMessagesQuery.hasMore}
              isFetchingMore={reportMessagesQuery.isFetchingMore}
              showGeneratingIndicator={isWaitingForStreamStart}
              onLoadMore={reportMessagesQuery.loadMore}
            />
          </div>

          <WeeklyButlerChatComposer
            value={message}
            onChange={handleChange}
            maxLength={WEEKLY_BUTLER_CHAT_INPUT_MAX_LENGTH}
            placeholder={placeholder}
            isInputDisabled={isInputDisabled}
            isSendDisabled={isSendDisabled}
            isSendHidden={isSendHidden}
            onSend={handleSend}
          />
        </div>
      </SectionCard>
    </section>
  );
}
