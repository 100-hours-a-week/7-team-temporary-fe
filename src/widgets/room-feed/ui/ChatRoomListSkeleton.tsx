const SKELETON_COUNT = 5;

export function ChatRoomListSkeleton() {
  return (
    <ul
      className="flex flex-col gap-2"
      aria-hidden
    >
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <li key={i}>
          <div className="w-full rounded-[20px] border border-neutral-200 bg-white px-6 py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="h-4 w-32 animate-pulse rounded-md bg-neutral-100" />
                <div className="h-4 w-10 animate-pulse rounded-md bg-neutral-100" />
              </div>
            </div>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div className="h-4 w-40 animate-pulse rounded-md bg-neutral-100" />
              <div className="h-4 w-10 animate-pulse rounded-md bg-neutral-100" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
