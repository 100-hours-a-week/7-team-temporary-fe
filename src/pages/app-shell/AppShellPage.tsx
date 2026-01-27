"use client";

import { AppHeader } from "@/widgets/app-header";
import { BottomNav, TabRoot, TabScope, useTab } from "@/widgets/tab-stack";
import { StackPageRoot, StackPageScope } from "@/widgets/stack";
import { HomePage } from "@/pages/home";
import { ProfilePage } from "@/pages/profile";

function AppShellHeader() {
  const { activeTab } = useTab();

  if (activeTab === "home") {
    return (
      <AppHeader
        title="홈"
        onNotificationClick={() => {
          console.log("notification");
        }}
      />
    );
  }

  if (activeTab === "profile") {
    return (
      <AppHeader
        title="프로필"
        onNotificationClick={() => {
          console.log("notification");
        }}
      />
    );
  }

  return null;
}

export function AppShellPage() {
  return (
    <StackPageRoot>
      <StackPageScope
        showHeader
        className="h-dvh"
        pageClassName="py-0"
      >
        <TabRoot initialTab="home">
          <div className="relative flex h-dvh w-full flex-col overflow-hidden">
            <AppShellHeader />
            <div className="relative flex-1 overflow-hidden">
              <TabScope
                tab="home"
                className="h-full"
              >
                <HomePage />
              </TabScope>
              <TabScope
                tab="profile"
                className="h-full"
              >
                <ProfilePage />
              </TabScope>
            </div>
            <BottomNav />
          </div>
        </TabRoot>
      </StackPageScope>
    </StackPageRoot>
  );
}
