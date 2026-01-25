"use client";

import { Icon } from "@/shared/ui/icon";

import { useTab } from "../model/tabContext";
import type { AppTab } from "../model/types";

const TAB_ITEMS: Array<{ id: AppTab; label: string }> = [
  { id: "home", label: "홈" },
  { id: "profile", label: "프로필" },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useTab();

  return (
    <nav className="border-secondary-200 fixed bottom-0 left-1/2 z-50 mb-8 w-full max-w-[420px] -translate-x-1/2 border-t bg-white px-6 py-3">
      <ul className="flex items-center justify-center gap-[19px]">
        {TAB_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const iconName = (() => {
            if (item.id === "home") return isActive ? "home_filled" : "home_outline";
            return isActive ? "user_filled" : "user_outline";
          })();
          const iconClassName = item.id === "profile" ? "h-[37px] w-[37px]" : "h-[37px] w-[37px]";

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex h-[70px] w-[46px] flex-col items-center justify-end gap-1 text-sm font-medium ${isActive ? "text-ink-900" : "text-ink-300"}`}
              >
                <Icon
                  name={iconName}
                  className={iconClassName}
                  aria-hidden="true"
                />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
