"use client";

import { useMemo, useState } from "react";

import {
  EXPLORE_RETRO_MOCKS,
  MY_PAGE_RETRO_MOCKS,
  RETRO_SECTION,
  type RetroSection,
} from "@/entities/retro";

export function useRetroSection(initialSection: RetroSection = RETRO_SECTION.MY_PAGE) {
  const [activeSection, setActiveSection] = useState<RetroSection>(initialSection);

  const retros = useMemo(
    () => (activeSection === RETRO_SECTION.MY_PAGE ? MY_PAGE_RETRO_MOCKS : EXPLORE_RETRO_MOCKS),
    [activeSection],
  );

  return {
    activeSection,
    setActiveSection,
    retros,
    isMyPage: activeSection === RETRO_SECTION.MY_PAGE,
  };
}
