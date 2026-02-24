interface WeeklyButlerQuickActionsProps {
  actions: readonly string[];
}

export function WeeklyButlerQuickActions({ actions }: WeeklyButlerQuickActionsProps) {
  return (
    <div className="flex justify-end pl-8">
      <div className="flex max-w-[95%] flex-wrap justify-start gap-2">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}
