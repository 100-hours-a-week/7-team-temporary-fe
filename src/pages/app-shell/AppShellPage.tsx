"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

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

function AppShellContent({ onReportClick }: AppShellContentProps) {
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
          <RoomPage enabled={activeTab === "room"} />
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

export function AppShellPage() {
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
          <AppShellContent onReportClick={handleReportClick} />
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
