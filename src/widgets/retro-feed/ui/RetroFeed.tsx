"use client";

import { RetroListItemCard, useRetroSection } from "@/features/retro";

import { RetroSectionTabs } from "./RetroSectionTabs";

export function RetroFeed() {
  const { activeSection, setActiveSection, retros } = useRetroSection();

  return (
    <section className="scrollbar-hide h-full overflow-y-auto px-6 pb-[90px]">
      <RetroSectionTabs
        activeSection={activeSection}
        onChange={setActiveSection}
      />

      <ul>
        {retros.map((retro) => (
          <li key={retro.id}>
            <RetroListItemCard {...retro} />
          </li>
        ))}
      </ul>
    </section>
  );
}
