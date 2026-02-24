"use client";

import { Icon } from "@/shared/ui/icon";
import type { IconName } from "@/shared/ui/icon";

import { useTab } from "../model/tabContext";
import type { AppTab } from "../model/types";

const TAB_ITEMS: Array<{
  id: AppTab;
  label: string;
  activeIcon: IconName;
  inactiveIcon: IconName;
}> = [
  { id: "home", label: "홈", activeIcon: "home_filled", inactiveIcon: "home_outline" },
  { id: "retro", label: "회고", activeIcon: "retro_filled", inactiveIcon: "retro" },
  { id: "profile", label: "프로필", activeIcon: "user_filled", inactiveIcon: "user_outline" },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useTab();

  return (
    <nav className="border-secondary-200 fixed bottom-0 left-1/2 z-50 mb-0 w-full max-w-[420px] -translate-x-1/2 rounded-t-2xl border-t bg-white px-6 pt-3 pb-[10px]">
      <ul className="flex items-center justify-center gap-[19px]">
        {TAB_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const iconName = isActive ? item.activeIcon : item.inactiveIcon;
          const iconClassName = item.id === "profile" ? "h-[37px] w-[37px]" : "h-[37px] w-[37px]";

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex w-[46px] flex-col items-center justify-end pb-2 text-sm font-medium ${isActive ? "text-ink-900" : "text-ink-300"}`}
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
