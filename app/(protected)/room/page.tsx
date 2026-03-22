import { Suspense } from "react";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { AppShellPage } from "@/pages/app-shell";
import { serverFetch, serverChatPath } from "@/shared/api/serverFetch";
import { chatRoomQueryKeys } from "@/entities/chat-room-query-keys";
import { camStudyRoomQueryKeys } from "@/entities/cam-study-room-query-keys";

async function RoomWithData() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
      },
    },
  });

  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: chatRoomQueryKeys.list(1, 10),
      queryFn: () =>
        serverFetch(serverChatPath("/chat-rooms/participants?type=OPEN_CHAT&page=1&size=10")),
    }),
    queryClient.prefetchQuery({
      queryKey: camStudyRoomQueryKeys.list(1, 10),
      queryFn: () =>
        serverFetch(serverChatPath("/chat-rooms/participants?type=CAM_STUDY&page=1&size=10")),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AppShellPage />
    </HydrationBoundary>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={<AppShellPage />}>
      <RoomWithData />
    </Suspense>
  );
}
