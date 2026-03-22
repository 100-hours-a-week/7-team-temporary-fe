import { Suspense } from "react";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { AppShellPage } from "@/pages/app-shell";
import { serverFetch, serverTaskPath } from "@/shared/api/serverFetch";
import { retroQueryKeys } from "@/entities/retro";

async function RetroWithData() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
      },
    },
  });

  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: retroQueryKeys.myList(1, 10),
      queryFn: () =>
        serverFetch(serverTaskPath("/reflections/me?page=1&size=10"), {
          cache: "no-store",
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: retroQueryKeys.publicList(true, 1, 10),
      queryFn: () =>
        serverFetch(serverTaskPath("/reflections?isOpen=true&page=1&size=10"), {
          next: { revalidate: 60 },
        }),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AppShellPage />
    </HydrationBoundary>
  );
}

export default function RetroPage() {
  return (
    <Suspense fallback={<AppShellPage />}>
      <RetroWithData />
    </Suspense>
  );
}
