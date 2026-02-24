"use client";

import { useState } from "react";

import { AppHeader, ReportSheet } from "@/widgets/app-header";
import { BottomNav, TabRoot, TabScope, useTab } from "@/widgets/tab-stack";
import { StackPageRoot, StackPageScope, useStackPage } from "@/widgets/stack";
import { FriendStackPage } from "@/pages/friend";
import { HomePage } from "@/pages/home";
import { ProfilePage } from "@/pages/profile";
import { NotificationStackPage } from "@/pages/notification";
import { RetroPage } from "@/pages/retro";

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
    push(<NotificationStackPage />);
  };
  const handleFriendClick = async () => {
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
  const handleReportClick = () => setIsReportOpen(true);
  const handleReportClose = () => setIsReportOpen(false);

  return (
    <StackPageRoot>
      <StackPageScope
        showHeader
        className="h-dvh"
        pageClassName="py-0"
      >
        <TabRoot initialTab="home">
          <AppShellContent onReportClick={handleReportClick} />
        </TabRoot>
        <ReportSheet
          open={isReportOpen}
          onOpenChange={setIsReportOpen}
          onConfirm={handleReportClose}
          onCancel={handleReportClose}
        />
      </StackPageScope>
    </StackPageRoot>
  );
}
