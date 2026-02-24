"use client";

import { useEffect, useRef, useState } from "react";

import { useGroupChatRoomListQuery } from "@/entities/chat-room";
import { FloatingActionButton } from "@/shared/ui/button";
import { SectionTabs, type SectionTab } from "@/shared/ui/section-tabs";

import { ChatRoomList } from "./ChatRoomList";

const ROOM_SECTION = {
  GROUP_CHAT: "GROUP_CHAT",
} as const;

type RoomSection = (typeof ROOM_SECTION)[keyof typeof ROOM_SECTION];

const ROOM_TABS: ReadonlyArray<SectionTab<RoomSection>> = [
  { id: ROOM_SECTION.GROUP_CHAT, label: "그룹 채팅방" },
];

interface RoomFeedProps {
  enabled?: boolean;
  onChatRoomClick?: (roomId: number) => void;
  onChatSearchClick?: () => void;
}

export function RoomFeed({ enabled = true, onChatRoomClick, onChatSearchClick }: RoomFeedProps) {
  const [activeSection, setActiveSection] = useState<RoomSection>(ROOM_SECTION.GROUP_CHAT);
  const scrollRef = useRef<HTMLElement>(null);

  const groupChatQuery = useGroupChatRoomListQuery({ enabled });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeSection]);

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

      <ChatRoomList
        items={groupChatQuery.data?.content ?? []}
        onChatRoomClick={onChatRoomClick ?? (() => undefined)}
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
