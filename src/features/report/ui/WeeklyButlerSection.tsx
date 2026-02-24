import { SectionCard } from "@/shared/ui";

import {
  WEEKLY_BUTLER_CHAT_MAX_HEIGHT_PX,
  WEEKLY_BUTLER_CHAT_MIN_HEIGHT_PX,
  WEEKLY_BUTLER_CHAT_INPUT_MAX_LENGTH,
  WEEKLY_BUTLER_CHAT_INPUT_PLACEHOLDER,
  WEEKLY_BUTLER_CHAT_LIMIT_REACHED_PLACEHOLDER,
  WEEKLY_BUTLER_GREETING_LINES,
  WEEKLY_BUTLER_QUICK_ACTIONS,
} from "../model/weeklyButler.constants";
import { useWeeklyButlerChatForm } from "../model/useWeeklyButlerChatForm";
import { WeeklyButlerAvatar, WeeklyButlerBotBubble } from "./WeeklyButlerBubble";
import { WeeklyButlerChatComposer } from "./WeeklyButlerChatComposer";
import { WeeklyButlerHero } from "./WeeklyButlerHero";
import { WeeklyButlerQuickActions } from "./WeeklyButlerQuickActions";

export function WeeklyButlerSection() {
  const { message, isSendDisabled, isSendHidden, handleChange, handleSend } =
    useWeeklyButlerChatForm();

  const placeholder = isSendHidden
    ? WEEKLY_BUTLER_CHAT_LIMIT_REACHED_PLACEHOLDER
    : WEEKLY_BUTLER_CHAT_INPUT_PLACEHOLDER;

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

            <WeeklyButlerQuickActions actions={WEEKLY_BUTLER_QUICK_ACTIONS} />
          </div>

          <WeeklyButlerChatComposer
            value={message}
            onChange={handleChange}
            maxLength={WEEKLY_BUTLER_CHAT_INPUT_MAX_LENGTH}
            placeholder={placeholder}
            isSendDisabled={isSendDisabled}
            isSendHidden={isSendHidden}
            onSend={handleSend}
          />
        </div>
      </SectionCard>
    </section>
  );
}
