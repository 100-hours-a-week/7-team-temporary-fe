"use client";

import dynamic from "next/dynamic";
import { type ReactNode, useState } from "react";

import { AppHeader } from "@/widgets/app-header";
import { StackPageRoot, StackPageScope, useStackPage } from "@/widgets/stack";
import { BottomNav, TabRoot, TabScope, useTab } from "@/widgets/tab-stack";
import "./AppShellRoute.css";

const loadReportSheet = () =>
  import("@/widgets/app-header/ui/ReportSheet").then((m) => m.ReportSheet);

const ReportSheet = dynamic(loadReportSheet, { ssr: false });

interface TabPageProps {
  enabled?: boolean;
}

function TabPageFallback() {
  return (
    <div
      className="h-full w-full"
      aria-hidden
    />
  );
}

const RetroPage = dynamic<TabPageProps>(
  () => import("@/pages/retro/RetroPage").then((module) => module.RetroPage),
  {
    loading: TabPageFallback,
  },
);
const HomePage = dynamic<TabPageProps>(
  () => import("@/pages/home/HomePage").then((module) => module.HomePage),
  {
    loading: TabPageFallback,
  },
);
const RoomPage = dynamic<TabPageProps>(
  () => import("@/pages/room/RoomPage").then((module) => module.RoomPage),
  {
    loading: TabPageFallback,
  },
);
const ProfilePage = dynamic<TabPageProps>(
  () => import("@/pages/profile/ProfilePage").then((module) => module.ProfilePage),
  {
    loading: TabPageFallback,
  },
);

interface AppShellHeaderProps {
  onReportClick?: () => void;
}

interface AppShellContentProps {
  onReportClick?: () => void;
  /** /room 라우트에서 SSR 렌더를 위해 정적으로 주입되는 RoomPage 슬롯.
   *  dynamic() 청크 다운로드 없이 초기 HTML에 방 목록이 포함되어 LCP를 개선한다. */
  roomTab?: ReactNode;
}

function AppShellHeader({ onReportClick }: AppShellHeaderProps) {
  const { activeTab } = useTab();
  const { push } = useStackPage();

  const handleNotificationClick = async () => {
    const { NotificationStackPage } = await import("@/pages/notification");
    push(<NotificationStackPage />);
  };
  const handleFriendClick = async () => {
    const { FriendStackPage } = await import("@/pages/friend");
    push(<FriendStackPage />);
  };

  if (activeTab === "home") {
    return (
      <AppHeader
        title="홈"
        onFriendClick={handleFriendClick}
        onNotificationClick={handleNotificationClick}
        onReportClick={onReportClick}
      />
    );
  }

  if (activeTab === "retro") {
    return (
      <AppHeader
        title="회고"
        onFriendClick={handleFriendClick}
        onNotificationClick={handleNotificationClick}
        onReportClick={onReportClick}
      />
    );
  }

  if (activeTab === "room") {
    return (
      <AppHeader
        title="방"
        onFriendClick={handleFriendClick}
        onNotificationClick={handleNotificationClick}
        onReportClick={onReportClick}
      />
    );
  }

  if (activeTab === "profile") {
    return (
      <AppHeader
        title="프로필"
        onFriendClick={handleFriendClick}
        onNotificationClick={handleNotificationClick}
        onReportClick={onReportClick}
      />
    );
  }

  return null;
}

function AppShellContent({ onReportClick, roomTab }: AppShellContentProps) {
  const { activeTab } = useTab();

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden">
      <AppShellHeader onReportClick={onReportClick} />
      <div className="relative flex-1 overflow-hidden">
        <TabScope
          tab="home"
          className="h-full"
        >
          <HomePage enabled={activeTab === "home"} />
        </TabScope>
        <TabScope
          tab="retro"
          className="h-full"
        >
          <RetroPage enabled={activeTab === "retro"} />
        </TabScope>
        <TabScope
          tab="room"
          className="h-full"
        >
          {roomTab ?? <RoomPage enabled={activeTab === "room"} />}
        </TabScope>
        <TabScope
          tab="profile"
          className="h-full"
        >
          <ProfilePage enabled={activeTab === "profile"} />
        </TabScope>
      </div>
      <BottomNav />
    </div>
  );
}

interface AppShellPageProps {
  /** /room 라우트에서 SSR 렌더를 위해 정적으로 주입되는 RoomPage 슬롯 */
  roomTab?: ReactNode;
}

export function AppShellPage({ roomTab }: AppShellPageProps) {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const handleReportClick = () => {
    void loadReportSheet();
    setIsReportOpen(true);
  };
  const handleReportClose = () => setIsReportOpen(false);

  return (
    <StackPageRoot>
      <StackPageScope
        showHeader
        className="h-dvh"
        pageClassName="py-0"
      >
        <TabRoot>
          <AppShellContent
            onReportClick={handleReportClick}
            roomTab={roomTab}
          />
        </TabRoot>
        {isReportOpen ? (
          <ReportSheet
            open={isReportOpen}
            onOpenChange={setIsReportOpen}
            onConfirm={handleReportClose}
            onCancel={handleReportClose}
          />
        ) : null}
      </StackPageScope>
    </StackPageRoot>
  );
}
