"use client";

import { useRef, useState } from "react";

import { FloatingActionButton, FloatingActionDock } from "@/shared/ui/button";
import { SectionTabs, type SectionTab } from "@/shared/ui/section-tabs";

import { CamStudySection } from "./CamStudySection";
import { OpenChatSection } from "./OpenChatSection";

const ROOM_SECTION = {
  GROUP_CHAT: "GROUP_CHAT",
  CAM_STUDY: "CAM_STUDY",
} as const;

type RoomSection = (typeof ROOM_SECTION)[keyof typeof ROOM_SECTION];

const ROOM_TABS: ReadonlyArray<SectionTab<RoomSection>> = [
  { id: ROOM_SECTION.GROUP_CHAT, label: "그룹 채팅방" },
  { id: ROOM_SECTION.CAM_STUDY, label: "캠 스터디방" },
];

interface RoomFeedProps {
  enabled?: boolean;
  onChatRoomClick?: (roomId: number) => void;
  onChatSearchClick?: () => void;
}

export function RoomFeed({ enabled = true, onChatRoomClick, onChatSearchClick }: RoomFeedProps) {
  const [activeSection, setActiveSection] = useState<RoomSection>(ROOM_SECTION.GROUP_CHAT);
  const scrollRef = useRef<HTMLElement>(null);
  const isGroupChatSection = activeSection === ROOM_SECTION.GROUP_CHAT;
  const handleRoomClick = onChatRoomClick ?? (() => undefined);

  return (
    <section
      ref={scrollRef}
      className="scrollbar-hide h-full overflow-y-auto px-6 pb-[90px]"
    >
      <SectionTabs
        tabs={ROOM_TABS}
        activeTab={activeSection}
        onChange={setActiveSection}
      />

      {isGroupChatSection ? (
        <OpenChatSection
          enabled={enabled}
          onRoomClick={handleRoomClick}
          scrollRef={scrollRef}
        />
      ) : (
        <CamStudySection
          enabled={enabled}
          onRoomClick={handleRoomClick}
          scrollRef={scrollRef}
        />
      )}

      <FloatingActionDock>
        <FloatingActionButton
          icon="chat_single"
          label="방 찾기"
          onClick={onChatSearchClick}
        />
      </FloatingActionDock>
    </section>
  );
}
