"use client";

import { useTab } from "../model/tabContext";
import type { AppTab } from "../model/types";

const TAB_ITEMS: Array<{ id: AppTab; label: string }> = [
  { id: "home", label: "홈" },
  { id: "profile", label: "프로필" },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useTab();

  return (
    <nav className="border-secondary-200 fixed bottom-0 left-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 border-t bg-white px-6 py-3">
      <ul className="flex items-center justify-between">
        {TAB_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`text-sm font-medium ${isActive ? "text-primary-600" : "text-secondary-600"}`}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
