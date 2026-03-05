import type { ReportMessageItemVM } from "@/entities/report";

import {
  WeeklyButlerAvatar,
  WeeklyButlerBotBubble,
  WeeklyButlerUserBubble,
} from "./WeeklyButlerBubble";

interface WeeklyButlerMessageHistoryProps {
  messages: ReportMessageItemVM[];
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  isFetchingMore: boolean;
  showGeneratingIndicator: boolean;
  onLoadMore: () => void;
}

function formatSentTime(isoString: string) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function normalizeMessageContent(content: string) {
  const trimmed = content.trim();
  const compact = trimmed.replace(/[()\s]/g, "");
  if (compact === "내용없음") return "";
  return content;
}

export function WeeklyButlerMessageHistory({
  messages,
  isLoading,
  isError,
  hasMore,
  isFetchingMore,
  showGeneratingIndicator,
  onLoadMore,
}: WeeklyButlerMessageHistoryProps) {
  if (isLoading) {
    return <p className="px-1 text-sm text-neutral-400">대화 기록을 불러오는 중...</p>;
  }

  if (isError) {
    return <p className="px-1 text-sm text-red-400">대화 기록 조회에 실패했어요.</p>;
  }

  return (
    <>
      {hasMore ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isFetchingMore}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetchingMore ? "불러오는 중..." : "이전 대화 더보기"}
          </button>
        </div>
      ) : null}

      {messages.map((message) => {
        const timeLabel = formatSentTime(message.sentAt);
        const content = normalizeMessageContent(message.content);

        if (content.trim().length === 0) {
          return null;
        }

        if (message.senderType === "USER") {
          return (
            <div
              key={message.messageId}
              className="flex justify-end"
            >
              <div className="flex max-w-full flex-col items-end gap-1">
                <WeeklyButlerUserBubble>{content}</WeeklyButlerUserBubble>
                {timeLabel ? (
                  <span className="px-1 text-[11px] text-neutral-400">{timeLabel}</span>
                ) : null}
              </div>
            </div>
          );
        }

        return (
          <div
            key={message.messageId}
            className="flex items-end gap-2"
          >
            <WeeklyButlerAvatar
              emoji="🐹"
              className="mb-1"
            />
            <div className="flex max-w-full flex-col gap-1">
              <WeeklyButlerBotBubble>{content}</WeeklyButlerBotBubble>
              {timeLabel ? (
                <span className="px-1 text-[11px] text-neutral-400">{timeLabel}</span>
              ) : null}
            </div>
          </div>
        );
      })}

      {showGeneratingIndicator ? (
        <div className="flex items-end gap-2">
          <WeeklyButlerAvatar
            emoji="🐹"
            className="mb-1"
          />
          <div className="flex max-w-full flex-col gap-1">
            <WeeklyButlerBotBubble>
              <span
                className="inline-flex items-center gap-1"
                aria-label="햄스터 버틀러 답변 생성 중"
              >
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:240ms]" />
              </span>
            </WeeklyButlerBotBubble>
          </div>
        </div>
      ) : null}
    </>
  );
}
