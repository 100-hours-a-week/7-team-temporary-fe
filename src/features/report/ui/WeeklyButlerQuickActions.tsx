interface WeeklyButlerQuickActionsProps {
  actions: readonly string[];
  onActionClick?: (action: string) => void;
  disabled?: boolean;
}

export function WeeklyButlerQuickActions({
  actions,
  onActionClick,
  disabled = false,
}: WeeklyButlerQuickActionsProps) {
  return (
    <div className="flex justify-end pl-8">
      <div className="flex max-w-[95%] flex-wrap justify-start gap-2">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            disabled={disabled}
            onClick={() => onActionClick?.(action)}
            className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}
