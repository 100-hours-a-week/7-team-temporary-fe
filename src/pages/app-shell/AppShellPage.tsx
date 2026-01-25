"use client";

import { AppHeader } from "@/widgets/app-header";
import { BottomNav, TabRoot, TabScope, useTab } from "@/widgets/tab-stack";
import { StackPageRoot, StackPageScope } from "@/widgets/stack";
import { HomePage } from "@/pages/home";
import { ProfilePage } from "@/pages/profile";

function TabStack({ children }: { children: React.ReactNode }) {
  return (
    <StackPageRoot>
      <StackPageScope
        showHeader={false}
        className="h-full pb-20"
      >
        {children}
      </StackPageScope>
    </StackPageRoot>
  );
}

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
    <TabRoot initialTab="home">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden">
        <AppShellHeader />
        <div className="relative flex-1 overflow-hidden">
          <TabScope
            tab="home"
            className="h-full"
          >
            <TabStack>
              <HomePage />
            </TabStack>
          </TabScope>
          <TabScope
            tab="profile"
            className="h-full"
          >
            <TabStack>
              <ProfilePage />
            </TabStack>
          </TabScope>
        </div>
        <BottomNav />
      </div>
    </TabRoot>
  );
}
