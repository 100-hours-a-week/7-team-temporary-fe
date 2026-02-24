"use client";

import { RETRO_SECTION, type RetroSection } from "@/entities/retro";

interface RetroSectionTabsProps {
  activeSection: RetroSection;
  onChange: (section: RetroSection) => void;
}

export function RetroSectionTabs({ activeSection, onChange }: RetroSectionTabsProps) {
  const isMyPage = activeSection === RETRO_SECTION.MY_PAGE;

  return (
    <div className="scrollbar-hide overflow-x-auto">
      <div className="flex w-max items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(RETRO_SECTION.MY_PAGE)}
          aria-pressed={isMyPage}
          className={`h-[30px] min-w-[30px] rounded-full px-3 text-[14px] font-medium ${
            isMyPage ? "bg-[#541e0f] text-white" : "border-1 border-[#541e0f] text-[#541e0f]"
          }`}
        >
          내 페이지
        </button>
        <button
          type="button"
          onClick={() => onChange(RETRO_SECTION.EXPLORE)}
          aria-pressed={!isMyPage}
          className={`h-[30px] min-w-[30px] rounded-full px-4 text-[14px] font-medium ${
            isMyPage ? "border-1 border-[#541e0f] text-[#541e0f]" : "bg-[#541e0f] text-white"
          }`}
        >
          둘러보기
        </button>
      </div>
    </div>
  );
}
