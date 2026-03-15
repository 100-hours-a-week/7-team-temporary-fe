# AppShell 기반 SPA 탭 구조 분석

> 작성일: 2026-03-15  
> 대상 코드베이스: `7-team-temporary-fe`

## 왜 이 문서를 쓰는가

현재 보호 영역의 메인 진입은 `App Router` 위에서 동작하지만, 실제 사용자 탭 전환은 URL 라우팅이 아니라 `AppShell` 내부 상태(`activeTab`)로 처리된다. 이 구조는 모바일 앱과 유사한 UX를 제공하지만, URL 기반 내비게이션과는 다른 제약을 만든다.

이 문서는 현재 구조를 정확히 기록하고, 이후 "바텀 내비 클릭 시 URL 이동" 전환 논의를 위한 기준선을 남기기 위해 작성한다.

## 1. 현재 라우팅 진입점

### 1-1. 보호 영역 레이아웃

- 파일: `app/(protected)/layout.tsx`
- 역할:
- 로그인 토큰 기준으로 `chatStompSession` 연결/종료
- 보호 영역 공통 상태 초기화
- FCM foreground 메시지 토스트 처리

즉, 보호 영역 전체 생명주기는 `layout.tsx`가 관리하고, 페이지 자체는 이 위에서 렌더링된다.

#### 1-1-1. `layout.tsx` 실제 구현 포인트

보호 영역은 화면 레이아웃일 뿐 아니라, 인증/실시간 연결의 루트 런타임이기도 하다.

```tsx
useEffect(() => {
  if (!accessToken) {
    chatStompSession.stop({ code: "LOGOUT", message: "로그아웃으로 연결을 종료합니다." });
    return;
  }
  chatStompSession.start(accessToken);
}, [accessToken]);
```

로그인 상태가 바뀌면 소켓을 start/stop 한다.

```tsx
useEffect(() => {
  return () => {
    chatStompSession.stop({ code: "APP_UNMOUNT", message: "앱 언마운트로 연결을 종료합니다." });
  };
}, []);
```

보호 레이아웃이 언마운트될 때도 소켓 정리를 보장한다.

```tsx
useEffect(() => {
  const prevAccessToken = prevAccessTokenRef.current;
  if (prevAccessToken && !accessToken) {
    queryClient.clear();
    useHomePlanStore.getState().clearHomePlan();
    useAiArrangeNoticeStore.getState().clearExcludedTitles();
    useUserPreferencesStore.getState().setSchedulePreferences({
      dayEndTime: null,
      focusTimeZone: null,
    });
  }
  prevAccessTokenRef.current = accessToken;
}, [accessToken, queryClient]);
```

토큰이 사라지는 시점(로그아웃)에 캐시/스토어를 리셋한다.

#### 1-1-2. FCM 등록/수신 실제 흐름

문서 상 "foreground 토스트 처리"는 단일 기능처럼 보이지만, 실제로는 권한 가드 -> 토큰 등록 -> foreground 수신 구독의 3단계로 구성된다.

```tsx
useEffect(() => {
  if (!accessToken) return;
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  let cancelled = false;
  const run = async () => {
    if (cancelled) return;
    const { registerFcmToken } = await import("@/shared/firebase/registerFcmToken");
    if (cancelled) return;
    await registerFcmToken({ promptPermission: false });
  };

  void run();
  return () => {
    cancelled = true;
  };
}, [accessToken]);
```

```tsx
useEffect(() => {
  let cancelled = false;
  let unsubscribe: (() => void) | null = null;

  const run = async () => {
    const [{ getFirebaseMessaging }, { onMessage }] = await Promise.all([
      import("@/shared/firebase/firebase"),
      import("firebase/messaging"),
    ]);
    const messaging = await getFirebaseMessaging();
    if (!messaging || cancelled) return;

    unsubscribe = onMessage(messaging, (payload) => {
      const title = payload.data?.title ?? payload.notification?.title ?? "MOLIP";
      const body = payload.data?.content ?? payload.data?.body ?? payload.notification?.body ?? "";
      showToast(body ? `${title} - ${body}` : title, "info");
    });
  };

  void run();
  return () => {
    cancelled = true;
    if (unsubscribe) unsubscribe();
  };
}, [showToast]);
```

즉, 보호 레이아웃은 탭 컨테이너보다 상위에서 "실시간 채널(소켓/푸시)"을 동시에 관리하는 런타임 루트 역할을 수행한다.

### 1-2. 메인 진입 URL

- 파일: `app/(protected)/home/page.tsx`
- 동작: `AppShellPage`를 렌더링

```tsx
import { AppShellPage } from "@/pages/app-shell";

export default function HomePage() {
  return <AppShellPage />;
}
```

핵심은 메인 앱 화면이 `/home` URL 하나에 고정되어 있다는 점이다.

## 2. AppShell의 내부 구성

파일: `src/pages/app-shell/AppShellPage.tsx`

구조는 아래와 같다.

1. `StackPageRoot`
2. `StackPageScope`
3. `TabRoot(initialTab="home")`
4. `AppShellContent`
5. `BottomNav`

간단한 흐름 다이어그램:

```text
/home
  -> AppShellPage
      -> StackPageRoot
          -> StackPageScope
              -> TabRoot(activeTab state)
                  -> AppShellContent
                      -> TabScope(home|retro|room|profile)
                      -> BottomNav
```

### 2-1. `AppShellPage.tsx` 실제 구현 스니펫

현재 구현은 아래 4개 블록으로 이해하면 빠르다.

#### 1) 탭 페이지 동적 로딩

```tsx
const RetroPage = dynamic<TabPageProps>(
  () => import("@/pages/retro/RetroPage").then((module) => module.RetroPage),
  { loading: TabPageFallback },
);
const RoomPage = dynamic<TabPageProps>(
  () => import("@/pages/room/RoomPage").then((module) => module.RoomPage),
  { loading: TabPageFallback },
);
const ProfilePage = dynamic<TabPageProps>(
  () => import("@/pages/profile/ProfilePage").then((module) => module.ProfilePage),
  { loading: TabPageFallback },
);
```

#### 2) `activeTab` 기준 헤더 분기

```tsx
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
```

#### 3) `TabScope` 기반 탭 컨텐츠 렌더링

```tsx
function AppShellContent({ onReportClick }: AppShellContentProps) {
  const { activeTab } = useTab();

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden">
      <AppShellHeader onReportClick={onReportClick} />
      <div className="relative flex-1 overflow-hidden">
        <TabScope tab="home" className="h-full">
          <HomePage enabled={activeTab === "home"} />
        </TabScope>
        <TabScope tab="retro" className="h-full">
          <RetroPage enabled={activeTab === "retro"} />
        </TabScope>
        <TabScope tab="room" className="h-full">
          <RoomPage enabled={activeTab === "room"} />
        </TabScope>
        <TabScope tab="profile" className="h-full">
          <ProfilePage enabled={activeTab === "profile"} />
        </TabScope>
      </div>
      <BottomNav />
    </div>
  );
}
```

#### 4) 최종 조합 (`StackPage` + `TabRoot`)

```tsx
export function AppShellPage() {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const handleReportClick = () => setIsReportOpen(true);
  const handleReportClose = () => setIsReportOpen(false);

  return (
    <StackPageRoot>
      <StackPageScope showHeader className="h-dvh" pageClassName="py-0">
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
```

정리하면, `AppShellPage`는 "라우팅 컨테이너"이면서 동시에 "탭 상태 오케스트레이터" 역할을 함께 가진다.

### 2-2. AppShell에서 이미 적용된 번들 분할 포인트

현재 구조는 탭 URL을 쓰지 않지만, 초기 로드 최적화를 위해 동적 import를 적극 사용한다.

```tsx
const ReportSheet = dynamic(
  () => import("@/widgets/app-header/ui/ReportSheet").then((m) => m.ReportSheet),
  { ssr: false },
);
```

`ReportSheet`는 즉시 필요한 UI가 아니기 때문에 클라이언트에서만 지연 로딩한다.

```tsx
function TabPageFallback() {
  return (
    <div
      className="h-full w-full"
      aria-hidden
    />
  );
}
```

탭 본문 페이지(`RetroPage`, `RoomPage`, `ProfilePage`)도 동적으로 분리하고, 로딩 중에는 빈 스켈레톤 영역만 렌더링한다.

```tsx
const handleNotificationClick = async () => {
  const { NotificationStackPage } = await import("@/pages/notification");
  push(<NotificationStackPage />);
};
```

헤더 버튼으로 열리는 오버레이 페이지도 클릭 시점에 import 되므로, `/home` 첫 진입 번들에는 포함되지 않는다.

## 3. 탭 전환은 URL이 아니라 상태 전환

### 3-1. 탭 상태 저장 위치

- 파일: `src/widgets/tab-stack/model/tabContext.tsx`
- 구현: `useState<AppTab>(initialTab)`

즉 `activeTab`은 브라우저 주소와 독립적인 메모리 상태이다.

### 3-2. 바텀 내비 동작

- 파일: `src/widgets/tab-stack/ui/BottomNav.tsx`
- 현재 클릭 동작:

```tsx
onClick={() => setActiveTab(item.id)}
```

`router.push()`가 아니라 context state만 변경한다. 따라서 URL은 그대로 유지된다.

### 3-3. `BottomNav.tsx` 실제 구현 스니펫

`BottomNav`는 탭 메타 정보(`TAB_ITEMS`)를 순회하면서 아이콘/라벨/활성 상태를 렌더링한다.

```tsx
const TAB_ITEMS = [
  { id: "home", label: "홈", activeIcon: "home_filled", inactiveIcon: "home_outline" },
  { id: "retro", label: "회고", activeIcon: "retro_filled", inactiveIcon: "retro" },
  { id: "room", label: "방", activeIcon: "room_filled", inactiveIcon: "room" },
  { id: "profile", label: "프로필", activeIcon: "user_filled", inactiveIcon: "user_outline" },
];
```

실제 탭 전환은 아래처럼 `setActiveTab` 호출로 처리된다.

```tsx
export function BottomNav() {
  const { activeTab, setActiveTab } = useTab();

  return (
    <nav className="border-secondary-200 fixed bottom-0 left-1/2 z-50 mb-0 w-full max-w-[420px] -translate-x-1/2 rounded-t-2xl border-t bg-white px-6 pt-3 pb-[10px]">
      <ul className="flex items-center justify-center gap-[19px]">
        {TAB_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const iconName = isActive ? item.activeIcon : item.inactiveIcon;
          const iconClassName = item.id === "profile" ? "h-[37px] w-[37px]" : "h-[37px] w-[37px]";
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex w-[46px] flex-col items-center justify-end pb-2 text-sm font-medium ${isActive ? "text-ink-900" : "text-ink-300"}`}
              >
                <Icon
                  name={iconName}
                  className={iconClassName}
                  aria-hidden="true"
                />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

핵심 포인트는 바텀 내비가 `router.push()`를 호출하지 않고, 탭 상태(context)만 갱신한다는 점이다.

### 3-4. `tabContext.tsx` 실제 구현 스니펫

`activeTab`은 전역 스토어가 아니라 `TabProvider` 내부의 로컬 상태다.

```tsx
export function TabProvider({ initialTab = "home", children }: TabProviderProps) {
  const [activeTab, setActiveTab] = useState<AppTab>(initialTab);

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
    }),
    [activeTab],
  );

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
}
```

이 구조의 의미:

- 탭 전환은 메모리 상태 변경이므로 URL에 반영되지 않음
- 새로고침 시 `initialTab`으로 복귀함
- 외부 링크/딥링크에서 특정 탭 강제 진입이 어려움

### 3-5. `TabRoot`와 `AppTab` 타입 계약

`TabRoot`는 별도 로직 없이 `TabProvider`를 감싸는 얇은 루트 컴포넌트다.

```tsx
interface TabRootProps {
  initialTab?: AppTab;
  children: ReactNode;
}

export function TabRoot({ initialTab, children }: TabRootProps) {
  return <TabProvider initialTab={initialTab}>{children}</TabProvider>;
}
```

탭 식별자는 문자열 자유 입력이 아니라 유니온 타입으로 고정된다.

```tsx
export type AppTab = "home" | "retro" | "room" | "profile";
```

즉, 바텀 내비/탭 스코프/헤더 분기 모두 동일한 타입 집합 위에서 동작한다.

### 3-6. Provider 경계와 실패 조건

현재 탭/스택 훅은 Provider 경계 밖에서 호출되면 즉시 오류를 던지도록 설계되어 있다.

```tsx
export function useTab() {
  const ctx = useContext(TabContext);
  if (!ctx) {
    throw new Error("useTab must be used within TabProvider");
  }
  return ctx;
}
```

```tsx
export function useStackPage() {
  const ctx = useContext(StackPageContext);
  if (!ctx) {
    throw new Error("useStackPage must be used within StackPageRoot");
  }
  // ...
}
```

따라서 `TabRoot`/`StackPageRoot` 트리를 분리하거나 라우트 단위로 재배치할 때는 Provider 경계를 먼저 설계해야 한다.

## 4. TabScope 렌더링 정책

- 파일: `src/widgets/tab-stack/ui/TabScope.tsx`
- 기본값: `keepMounted = false`

현재 `AppShellPage`에서 `keepMounted`를 전달하지 않기 때문에, 비활성 탭은 언마운트된다.

```tsx
if (!isActive && !keepMounted) {
  return null;
}
```

결과:

- 탭 전환 시 비활성 탭 컴포넌트는 내려감(unmount)
- 다시 탭으로 돌아오면 새로 mount
- 탭 내부 로컬 상태와 effect 생명주기도 재시작

### 4-1. `TabScope.tsx` 실제 구현 스니펫

```tsx
export function TabScope({ tab, children, className, keepMounted = false }: TabScopeProps) {
  const { activeTab } = useTab();
  const isActive = activeTab === tab;

  if (!isActive && !keepMounted) {
    return null;
  }

  return (
    <div className={cn("w-full", isActive ? "block" : "hidden", className)} data-tab={tab}>
      {children}
    </div>
  );
}
```

`keepMounted` 해석:

- `false`(기본): 탭 비활성 시 언마운트
- `true`: DOM은 유지하고 `hidden` 처리만 수행

현재 `AppShellPage`는 `keepMounted`를 전달하지 않기 때문에 기본값(`false`) 정책을 사용한다.

## 5. StackPage는 탭 내부 오버레이 네비게이션

- 핵심 파일:
- `src/widgets/stack/model/useStackPageState.ts`
- `src/widgets/stack/ui/StackPageScope.tsx`

동작 요약:

- `push(element)` 호출 시 스택에 overlay entry 추가
- `window.history.pushState({ stackDepth })`로 브라우저 뒤로가기에 연동
- `pop()` 시 exit animation 후 `window.history.back()` 호출

즉, 앱 전체 라우팅과 별개로 "탭 내부 페이지 전환"을 오버레이 스택으로 흉내내는 구조이다.

### 5-1. `useStackPageState.ts` 실제 구현 스니펫

핵심은 `stack[]` 상태와 브라우저 history의 동기화다.

```tsx
const push = useCallback((element: StackEntry["element"]) => {
  setStack((prev) => {
    const next = [...prev, { key: createStackKey(), element, headerContent: null, headerRightContent: null }];
    window.history.pushState({ stackDepth: next.length }, "");
    return next;
  });
}, []);
```

```tsx
useEffect(() => {
  const handlePopState = (event: PopStateEvent) => {
    const depth = typeof event.state?.stackDepth === "number" ? event.state.stackDepth : 0;
    setStack((prev) => prev.slice(0, depth));
    setPoppingKey(null);
  };

  window.history.replaceState({ stackDepth: 0 }, "");
  window.addEventListener("popstate", handlePopState);
  return () => window.removeEventListener("popstate", handlePopState);
}, []);
```

```tsx
useEffect(() => {
  if (!poppingKey) return;

  const timer = window.setTimeout(() => {
    setStack((prev) => prev.slice(0, -1));
    setPoppingKey(null);
    window.history.back();
  }, STACK_PAGE_EXIT_MS);

  return () => window.clearTimeout(timer);
}, [poppingKey]);
```

즉, `push`는 즉시 `history.pushState`, `pop`은 애니메이션 후 `history.back`을 호출한다.

### 5-1-1. `replace`, `depth` 계약

문서에는 `push/pop` 중심으로 설명되어 있지만, 실제 API 계약은 `replace`, `depth`까지 포함한다.

```tsx
const replace = useCallback((element: StackEntry["element"]) => {
  setStack((prev) => {
    if (prev.length === 0) {
      const next = [{ key: createStackKey(), element, headerContent: null, headerRightContent: null }];
      window.history.pushState({ stackDepth: next.length }, "");
      return next;
    }
    return [
      ...prev.slice(0, -1),
      { key: createStackKey(), element, headerContent: null, headerRightContent: null },
    ];
  });
}, []);
```

```tsx
return useMemo(
  () => ({
    push,
    pop,
    replace,
    depth: stack.length,
    // ...
  }),
  [push, pop, replace, stack],
);
```

`replace`는 "현재 최상단 overlay를 다른 화면으로 치환"하는 전환에 사용되고, `depth`는 헤더/레이어 제어와 디버깅 지표로 쓰인다.

### 5-2. `StackPageScope.tsx` 실제 렌더링 스니펫

오버레이가 있을 때 base page를 뒤로 밀고, 스택 엔트리를 절대배치 레이어로 쌓는다.

```tsx
return (
  <Component className={cn("text-ink-900 relative w-full overflow-hidden", className)}>
    <div
      className={cn(
        "relative z-0 h-full min-h-0 w-full bg-[#F8F8F8] py-10 transition-transform duration-300 ease-out",
        hasOverlay && !isPopping && STACK_PAGE_BASE_CLASS,
        hasOverlay && isPopping && STACK_PAGE_BASE_EXIT_CLASS,
        pageClassName,
      )}
    >
      <StackPageEntryContext.Provider value={{ entryKey: null }}>
        {renderBasePage(children)}
      </StackPageEntryContext.Provider>
    </div>
    {stack.map((entry, index) => (
      <div
        key={entry.key}
        className={cn(
          "absolute inset-0 min-h-0 bg-[#F8F8F8]",
          STACK_PAGE_OVERLAY_CLASS,
          entry.key === poppingKey && STACK_PAGE_OVERLAY_EXIT_CLASS,
          pageClassName,
          overlayClassName,
        )}
        style={{ zIndex: index + 1 }}
      >
        <StackPageEntryContext.Provider value={{ entryKey: entry.key }}>
          {renderOverlayPage(entry.element, header)}
        </StackPageEntryContext.Provider>
      </div>
    ))}
  </Component>
);
```

이 때문에 "탭 안의 세부 페이지 이동"은 URL 이동 없이도 앱처럼 보이는 화면 전환을 만들 수 있다.

### 5-3. Stack 헤더 슬롯의 스코프 분리 방식

`useStackPage()`는 현재 렌더링 중인 entry key를 읽어, 헤더 슬롯 설정 함수를 "현재 엔트리 스코프"로 래핑한다.

```tsx
export function useStackPage() {
  const ctx = useContext(StackPageContext);
  const entry = useContext(StackPageEntryContext);
  const entryKey = entry?.entryKey ?? null;

  const scopedSetHeaderContent = useCallback(
    (content: ReactNode | null) => ctx.setHeaderContent(content, entryKey),
    [ctx.setHeaderContent, entryKey],
  );
  const scopedSetHeaderRightContent = useCallback(
    (content: ReactNode | null) => ctx.setHeaderRightContent(content, entryKey),
    [ctx.setHeaderRightContent, entryKey],
  );

  return useMemo(
    () => ({
      ...ctx,
      setHeaderContent: scopedSetHeaderContent,
      setHeaderRightContent: scopedSetHeaderRightContent,
    }),
    [ctx, scopedSetHeaderContent, scopedSetHeaderRightContent],
  );
}
```

`useStackPageState`에서는 이 entry key를 기준으로 base 헤더와 overlay 헤더를 분리 저장한다.

```tsx
const setHeaderContent = useCallback((content: ReactNode | null, entryKey: string | null) => {
  if (!entryKey) {
    setBaseHeaderContent((prev) => (prev === content ? prev : content));
    return;
  }

  setStack((prev) =>
    prev.map((entry) => {
      if (entry.key !== entryKey) return entry;
      if (entry.headerContent === content) return entry;
      return { ...entry, headerContent: content };
    }),
  );
}, []);
```

따라서 상세 페이지가 여러 겹으로 쌓여도, 최상단 overlay가 자신의 헤더만 안전하게 제어할 수 있다.

### 5-4. 애니메이션 상수와 CSS 결합

`StackPage` 전환 시간은 TS 상수와 CSS가 같이 맞물려 동작한다.

```ts
export const STACK_PAGE_EXIT_MS = 300;
export const STACK_PAGE_BASE_CLASS = "stack-page-base";
export const STACK_PAGE_BASE_EXIT_CLASS = "stack-page-base-exit";
export const STACK_PAGE_OVERLAY_CLASS = "stack-page-overlay";
export const STACK_PAGE_OVERLAY_EXIT_CLASS = "stack-page-overlay-exit";
```

```css
.stack-page-overlay {
  animation: stack-page-slide-in 300ms ease-out;
}

.stack-page-overlay-exit {
  animation: stack-page-slide-out 300ms ease-out;
}
```

즉, `STACK_PAGE_EXIT_MS`를 바꿀 때는 `AppShellRoute.css`의 `300ms` 타이밍도 함께 맞추지 않으면 pop 시점과 시각 효과가 어긋날 수 있다.

### 5-5. 브라우저 히스토리 초기화/동기화 리스크

`StackPage`는 마운트 시점마다 history state를 초기화한 뒤 popstate를 구독한다.

```tsx
useEffect(() => {
  const handlePopState = (event: PopStateEvent) => {
    const depth = typeof event.state?.stackDepth === "number" ? event.state.stackDepth : 0;
    setStack((prev) => prev.slice(0, depth));
    setPoppingKey(null);
  };

  window.history.replaceState({ stackDepth: 0 }, "");
  window.addEventListener("popstate", handlePopState);
  return () => window.removeEventListener("popstate", handlePopState);
}, []);
```

URL 기반 라우팅으로 전환할 때는 아래 충돌 가능성을 함께 검토해야 한다.

1. 동일 엔트리의 기존 `history.state`가 `stackDepth`로 덮어써질 수 있음
2. 다른 레이어(App Router, analytics, 커스텀 popstate 핸들러)와 상태 키 충돌이 발생할 수 있음
3. 탭 URL 이동과 overlay pop이 동시에 일어나면 사용자 기대와 다른 뒤로가기 동선이 만들어질 수 있음

## 6. 탭별 페이지 연결 방식

`AppShellContent`는 네 탭을 렌더링한다.

- `home` -> `HomePage` (정적 import)
- `retro` -> `RetroPage` (dynamic import)
- `room` -> `RoomPage` (dynamic import)
- `profile` -> `ProfilePage` (dynamic import)

헤더 제목도 `activeTab`에 따라 `홈/회고/방/프로필`로 분기한다.

### 6-1. 탭 내부 상세 이동은 `useStackPage().push()`

예를 들어 `RoomPage`는 라우터 이동이 아니라 스택 오버레이를 쌓는다.

```tsx
export function RoomPage({ enabled = true }: RoomPageProps) {
  const { push } = useStackPage();

  const handleOpenChatSearch = () => {
    push(<ChatSearchStackPage />);
  };

  const handleOpenChatRoom = (id: number) => {
    push(<ChatRoomStackPage roomId={id} />);
  };

  const handleOpenCamStudyRoom = (room: CamStudyRoomListItemVM) => {
    push(
      <CamStudyRoomStackPage
        roomId={room.roomId}
        initialTitle={room.title}
        initialSummary={{
          activeCamParticipantsCount: room.participantsCount,
          participantsCount: room.participantsCount,
          maxParticipants: room.maxParticipants,
        }}
      />,
    );
  };

  return (
    <RoomFeed
      enabled={enabled}
      onChatRoomClick={handleOpenChatRoom}
      onCamStudyRoomClick={handleOpenCamStudyRoom}
      onChatSearchClick={handleOpenChatSearch}
    />
  );
}
```

결론적으로 현재 탭 내부 내비게이션은 `App Router`보다 `StackPage` 추상화에 더 크게 의존한다.

### 6-2. `AppHeader`와 `StackHeader`의 책임 분리

현재 상단 UI는 동일한 `HeaderFrame`을 공유하지만, 역할은 명확히 나뉜다.

```tsx
// AppHeader: 탭 루트 화면용
<HeaderFrame
  leftSlot={<span className="text-ink-900 text-xl font-semibold">{title}</span>}
  rightSlot={
    <div className="flex flex-row items-center gap-2">
      <IconButton icon="siren" label="신고" onClick={onReportClick} />
      <IconButton icon="friend" label="친구" onClick={onFriendClick} />
      <IconButton icon="notification" label="알림" onClick={onNotificationClick} />
    </div>
  }
/>
```

```tsx
// StackHeader: 오버레이 상세 화면용
<HeaderFrame
  leftSlot={
    actionLabel ? (
      <IconButton icon="prev" label={actionLabel} onClick={onActionClick} />
    ) : null
  }
  centerSlot={headerContent ?? (title ? <span className="text-ink-900 text-xl font-semibold">{title}</span> : null)}
  rightSlot={headerRightContent ?? <div className="h-full w-[30px]" />}
/>
```

`StackPageScope`는 기본적으로 `onHeaderActionClick ?? pop`을 사용하므로, 상세 오버레이에서는 뒤로가기 의미가 표준화되어 있다.

### 6-3. 공통 헤더 베이스(`HeaderFrame`) 계약

`AppHeader`와 `StackHeader`는 구현이 다르지만, 실제 레이아웃 계약은 `HeaderFrame`에서 동일하게 고정된다.

```tsx
export function HeaderFrame({ leftSlot, centerSlot, rightSlot, className }: HeaderFrameProps) {
  return (
    <header
      className={cn(
        "grid h-[52px] w-full grid-cols-3 grid-cols-[auto_1fr_auto] items-center gap-x-6 px-7 py-3",
        className,
      )}
    >
      <div className="justify-self-start">{leftSlot}</div>
      <div className="w-full justify-self-center align-middle">
        {centerSlot ? <div className="flex w-full items-center">{centerSlot}</div> : null}
      </div>
      <div className="justify-self-end">{rightSlot}</div>
    </header>
  );
}
```

즉, URL 전환 이후에도 헤더 배치 일관성은 `HeaderFrame`을 유지하는 한 깨지지 않는다.

## 7. URL 관점의 현재 상태

### 7-1. 실제 탭 URL 분리 상태

현재는 탭별 독립 URL이 사실상 없다.

- 메인 탭 UX: `/home` 내부 상태로 전환
- 일부 `chat` 라우트는 존재하지만(`app/(protected)/chat/*`), 현재 페이지 구현은 `null` 반환

즉 사용자 입장에서는 탭 이동을 해도 주소가 바뀌지 않는다.

#### 7-1-1. `chat` 라우트 placeholder 구현

```tsx
// app/(protected)/chat/page.tsx
export default function ChatPage() {
  return null;
}

// app/(protected)/chat/search/page.tsx
export default function ChatSearchPage() {
  return null;
}

// app/(protected)/chat/create/page.tsx
export default function ChatCreatePage() {
  return null;
}

// app/(protected)/chat/[roomId]/page.tsx
export default function ChatRoomPage() {
  return null;
}
```

라우트 엔트리는 존재하지만 실제 화면 책임은 아직 `AppShell + StackPage`가 갖고 있다는 증거다.

#### 7-1-2. 보호 영역 라우트 트리 스냅샷

현재 `app/(protected)` 하위 페이지 파일은 다음으로 고정되어 있다.

```text
app/(protected)/chat/[roomId]/page.tsx
app/(protected)/chat/create/page.tsx
app/(protected)/chat/page.tsx
app/(protected)/chat/search/page.tsx
app/(protected)/home/page.tsx
app/(protected)/layout.tsx
```

즉, 탭별 URL 페이지 파일(`retro`, `room`, `profile`) 자체가 아직 분리되어 있지 않아, `AppShell` 내부 상태 전환이 필수인 구조다.

### 7-2. 이 구조의 장점

- 탭 전환이 매우 빠르고 구현이 단순함
- 모바일 앱형 인터랙션(오버레이 스택)과 잘 맞음
- 공통 헤더/하단 내비를 고정하기 쉬움

### 7-3. 이 구조의 한계

- 딥링크/공유 URL이 약함
- 새로고침 시 탭 복원 불가(`activeTab` 메모리 상태)
- 브라우저 히스토리 의미가 URL 탭 전환과 일치하지 않음
- SEO/분석(페이지 기준 이벤트 분리) 측면에서 불리함

## 8. 현재 구조 한 줄 요약

현재 구조는 **App Router 위에 SPA형 인메모리 탭 + 오버레이 스택 네비게이션을 얹은 하이브리드 구조**이다.

따라서 "바텀 내비 클릭 시 URL 이동" 전환은 단순 클릭 핸들러 수정이 아니라, 다음 축을 함께 다뤄야 한다.

- 탭 상태의 source of truth를 URL로 이동
- 탭 내부 stack navigation과 App Router 책임 경계 재정의
- 탭 전환 시 상태 유지/복원 전략 결정(keepMounted vs URL 기반 캐시)

## 9. URL 전환을 위한 수정 포인트 맵

아래 파일들이 실제 전환 시 1차 수정 대상이 된다.

1. `src/widgets/tab-stack/ui/BottomNav.tsx`: 현재 `setActiveTab(item.id)` 호출을 URL 이동(`router.push`)으로 바꿔야 한다.
2. `src/widgets/tab-stack/model/tabContext.tsx`, `src/widgets/tab-stack/ui/TabRoot.tsx`: `activeTab` 메모리 상태 유지 전략을 축소하거나, URL을 source of truth로 읽는 어댑터 계층으로 바꿔야 한다.
3. `src/pages/app-shell/AppShellPage.tsx`: `TabScope` 기반 렌더링을 유지할지, App Router 세그먼트 기반 렌더링으로 치환할지 결정이 필요하다.
4. `src/widgets/stack/*`: 탭 내부 상세 이동을 계속 overlay stack으로 둘지, 일부는 URL 라우팅으로 승격할지 경계를 정해야 한다.
5. `app/(protected)/*`: `/home` 단일 진입 외에 탭별 URL 페이지(`retro`, `room`, `profile`)를 생성하면 책임이 App Router 쪽으로 이동한다.

현재 문서는 "현행 구조의 사실 기록"이 목적이므로, 위 수정 맵은 다음 설계 문서(전환안) 작성 시 체크리스트로 사용하면 된다.

### 9-1. URL 전환 완료 기준(DoD)

1. 바텀 내비 클릭 시 URL이 탭별로 변경되고, 새로고침 후에도 동일 탭이 복원된다.
2. 직접 URL 진입(딥링크)으로 탭 페이지 접근이 가능하고, `activeTab`과 표시 화면이 불일치하지 않는다.
3. 브라우저 뒤로가기/앞으로가기가 "탭 전환"과 "overlay pop"을 사용자 기대 순서로 재현한다.
4. 기존 `StackPage` 상세 이동(`push/pop/replace`)이 URL 전환 이후에도 회귀 없이 동작한다.
5. FCM foreground 토스트/소켓 연결 수명주기가 탭 URL 분리 이후에도 `app/(protected)/layout.tsx`에서 동일하게 유지된다.

---

## 참고 코드

- `app/(protected)/home/page.tsx`
- `app/(protected)/layout.tsx`
- `src/pages/app-shell/AppShellPage.tsx`
- `src/pages/app-shell/AppShellRoute.css`
- `src/widgets/tab-stack/model/tabContext.tsx`
- `src/widgets/tab-stack/model/types.ts`
- `src/widgets/tab-stack/ui/BottomNav.tsx`
- `src/widgets/tab-stack/ui/TabRoot.tsx`
- `src/widgets/tab-stack/ui/TabScope.tsx`
- `src/widgets/stack/model/constants.ts`
- `src/widgets/stack/model/stackPageContext.ts`
- `src/widgets/stack/model/useStackPageState.ts`
- `src/widgets/stack/ui/StackPageScope.tsx`
- `src/widgets/stack/ui/StackHeader.tsx`
- `src/widgets/app-header/ui/AppHeader.tsx`
- `src/widgets/app-header/ui/HeaderFrame.tsx`
