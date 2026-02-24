"use client";

import { cn } from "@/shared/lib";

export interface SectionTab<T extends string> {
  id: T;
  label: string;
}

interface SectionTabsProps<T extends string> {
  tabs: ReadonlyArray<SectionTab<T>>;
  activeTab: T;
  onChange: (tab: T) => void;
  className?: string;
}

export function SectionTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className,
}: SectionTabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn("scrollbar-hide overflow-x-auto", className)}
    >
      <div className="flex w-max items-center gap-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={cn(
                "h-[30px] min-w-[30px] rounded-full px-3 text-[14px] font-medium",
                isActive ? "bg-[#541e0f] text-white" : "border border-[#541e0f] text-[#541e0f]",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
