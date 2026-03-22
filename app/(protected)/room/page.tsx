import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { AppShellPage } from "@/pages/app-shell";
import { serverFetch, serverChatPath } from "@/shared/api/serverFetch";
import { chatRoomQueryKeys } from "@/entities/chat-room-query-keys";

// Suspense 스트리밍 제거 — fallback이 HydrationBoundary 없이 마운트되면
// dynamic import 완료 시점에 캐시가 비어 있어 클라이언트 재요청이 발생하는 race condition 방지
export default async function RoomPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
      },
    },
  });

  // 초기 탭(그룹 채팅방)만 prefetch — CAM_STUDY는 탭 전환 시 클라이언트에서 fetch
  await queryClient.prefetchQuery({
    queryKey: chatRoomQueryKeys.list(1, 10),
    queryFn: () =>
      serverFetch(serverChatPath("/chat-rooms/participants?type=OPEN_CHAT&page=1&size=10")),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AppShellPage />
    </HydrationBoundary>
  );
}
