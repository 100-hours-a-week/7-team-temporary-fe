export function ChatMessageFeedSkeleton() {
  return (
    <section className="flex flex-col gap-3 pb-6">
      <div className="flex items-start gap-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-200" />
        <div className="w-[80%] space-y-2">
          <div className="h-3 w-16 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-16 w-full animate-pulse rounded-2xl bg-neutral-100" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="h-14 w-[65%] animate-pulse rounded-2xl bg-neutral-100" />
      </div>
      <div className="flex items-start gap-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-200" />
        <div className="h-20 w-[78%] animate-pulse rounded-2xl bg-neutral-100" />
      </div>
    </section>
  );
}
