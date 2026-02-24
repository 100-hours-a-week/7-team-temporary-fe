interface WeeklyButlerChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder: string;
  isSendDisabled: boolean;
  isSendHidden: boolean;
  onSend: () => void;
}

export function WeeklyButlerChatComposer({
  value,
  onChange,
  maxLength,
  placeholder,
  isSendDisabled,
  isSendHidden,
  onSend,
}: WeeklyButlerChatComposerProps) {
  return (
    <div className="px-3 pt-2 pb-3">
      <label
        htmlFor="weekly-butler-chat-input"
        className="sr-only"
      >
        햄스터 버틀러 메시지 입력
      </label>
      <div className="flex items-end gap-2">
        <textarea
          id="weekly-butler-chat-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={maxLength}
          placeholder={placeholder}
          rows={1}
          className="max-h-[88px] min-h-11 flex-1 resize-none overflow-y-auto rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[16px] text-neutral-900 placeholder:text-[16px] placeholder:text-neutral-400 focus:border-neutral-300 focus:outline-none sm:text-sm sm:placeholder:text-sm"
        />
        {!isSendHidden && (
          <button
            type="button"
            disabled={isSendDisabled}
            onClick={onSend}
            className="bg-primary-600 hover:bg-primary-500 h-11 shrink-0 rounded-xl px-4 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            전송
          </button>
        )}
      </div>
    </div>
  );
}
