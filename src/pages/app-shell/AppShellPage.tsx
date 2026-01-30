"use client";

import { AppHeader } from "@/widgets/app-header";
import { BottomNav, TabRoot, TabScope, useTab } from "@/widgets/tab-stack";
import { StackPageRoot, StackPageScope } from "@/widgets/stack";
import { HomePage } from "@/pages/home";
import { ProfilePage } from "@/pages/profile";
import { registerFcmToken } from "@/shared/firebase/index";
import { useToast } from "@/shared/ui/toast";

function AppShellHeader() {
  const { activeTab } = useTab();
  const { showToast } = useToast();

  const handleNotificationClick = async () => {
    try {
      const token = await registerFcmToken({ promptPermission: true });
      if (!token) {
        showToast("FCM 토큰 발급 실패", "error");
        return;
      }

      showToast("FCM 토큰 등록 완료", "success");
    } catch (error) {
      console.error("[FCM] token register failed", error);
      showToast("FCM 토큰 등록 실패", "error");
    }
  };

  if (activeTab === "home") {
    return (
      <AppHeader
        title="홈"
        onNotificationClick={handleNotificationClick}
      />
    );
  }

  if (activeTab === "profile") {
    return (
      <AppHeader
        title="프로필"
        onNotificationClick={handleNotificationClick}
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
