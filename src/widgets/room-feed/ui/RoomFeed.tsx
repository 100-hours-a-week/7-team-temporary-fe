"use client";

import { useState } from "react";

import { FloatingActionButton } from "@/shared/ui/button";
import { EmptyStateCard } from "@/shared/ui/empty";
import { SectionTabs, type SectionTab } from "@/shared/ui/section-tabs";

const ROOM_SECTION = {
  GROUP_CHAT: "GROUP_CHAT",
} as const;

type RoomSection = (typeof ROOM_SECTION)[keyof typeof ROOM_SECTION];

const ROOM_TABS: ReadonlyArray<SectionTab<RoomSection>> = [
  { id: ROOM_SECTION.GROUP_CHAT, label: "그룹 채팅방" },
];

interface RoomFeedProps {
  enabled?: boolean;
  onChatSearchClick?: () => void;
}

export function RoomFeed({ enabled: _enabled = true, onChatSearchClick }: RoomFeedProps) {
  const [activeSection, setActiveSection] = useState<RoomSection>(ROOM_SECTION.GROUP_CHAT);

  return (
    <section className="scrollbar-hide h-full overflow-y-auto px-6 pb-[90px]">
      <SectionTabs
        tabs={ROOM_TABS}
        activeTab={activeSection}
        onChange={setActiveSection}
      />

      <EmptyStateCard
        message="아직 들어간 채팅방이 없어요. 새로운 채팅방을 만들어볼까요?"
        className="mt-4"
      />

      {activeSection === ROOM_SECTION.GROUP_CHAT && (
        <div className="pointer-events-none fixed bottom-0 left-1/2 z-[60] w-full max-w-[420px] -translate-x-1/2">
          <FloatingActionButton
            icon="chat_single"
            label="채팅방 찾기"
            onClick={onChatSearchClick}
            className="pointer-events-auto absolute right-5 bottom-[calc(env(safe-area-inset-bottom)+110px)]"
          />
        </div>
      )}
    </section>
  );
}
