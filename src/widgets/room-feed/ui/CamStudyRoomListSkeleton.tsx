const SKELETON_COUNT = 5;

export function CamStudyRoomListSkeleton() {
  return (
    <ul
      className="flex flex-col gap-2"
      aria-hidden
    >
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <li key={i}>
          <div className="w-full rounded-[20px] border border-neutral-200 bg-white px-6 py-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <div className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-neutral-100" />
                <div className="h-4 w-28 animate-pulse rounded-md bg-neutral-100" />
              </div>
              <div className="h-4 w-12 animate-pulse rounded-md bg-neutral-100" />
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              <div className="h-4 w-full animate-pulse rounded-md bg-neutral-100" />
              <div className="h-4 w-3/4 animate-pulse rounded-md bg-neutral-100" />
            </div>
            <div className="mt-3 flex justify-end">
              <div className="h-4 w-12 animate-pulse rounded-md bg-neutral-100" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
