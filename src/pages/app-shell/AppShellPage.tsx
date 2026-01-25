"use client";

import { AppHeader } from "@/widgets/app-header";
import { BottomNav, TabRoot, TabScope, useTab, type AppTab } from "@/widgets/tab-stack";
import { StackPageRoot, StackPageScope } from "@/widgets/stack";
import { HomePage } from "@/pages/home";
import { ProfilePage } from "@/pages/profile";

function TabStack({ children }: { children: React.ReactNode }) {
  return (
    <StackPageRoot>
      <StackPageScope
        showHeader={false}
        className="min-h-dvh pb-20"
      >
        {children}
      </StackPageScope>
    </StackPageRoot>
  );
}

const TAB_LABELS: Record<AppTab, string> = {
  home: "홈",
  profile: "프로필",
};

function AppShellHeader() {
  const { activeTab } = useTab();

  return (
    <AppHeader
      actionLabel={null}
      headerContent={<span>{TAB_LABELS[activeTab]}</span>}
    />
  );
}

export function AppShellPage() {
  return (
    <TabRoot initialTab="home">
      <div className="relative min-h-dvh w-full">
        <AppShellHeader />
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
        <BottomNav />
      </div>
    </TabRoot>
  );
}
