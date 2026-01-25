import { BottomNav, TabRoot, TabScope } from "@/widgets/tab-stack";
import { StackPageRoot, StackPageScope } from "@/widgets/stack";

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

function HomeTab() {
  return <div className="px-6 py-10">홈 탭</div>;
}

function ProfileTab() {
  return <div className="px-6 py-10">프로필 탭</div>;
}

export function AppShellPage() {
  return (
    <TabRoot initialTab="home">
      <div className="relative min-h-dvh w-full">
        <TabScope
          tab="home"
          className="h-full"
        >
          <TabStack>
            <HomeTab />
          </TabStack>
        </TabScope>
        <TabScope
          tab="profile"
          className="h-full"
        >
          <TabStack>
            <ProfileTab />
          </TabStack>
        </TabScope>
        <BottomNav />
      </div>
    </TabRoot>
  );
}
