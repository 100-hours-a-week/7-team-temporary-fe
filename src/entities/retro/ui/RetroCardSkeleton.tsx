/**
 * RetroCardView 레이아웃을 그대로 따라 만든 스켈레톤.
 *
 * 구조:
 *   header  [날짜 회고 블록] [닉네임 블록]          [시간 블록]
 *   content [라인1]
 *           [라인2]
 *           [라인3 (짧음)]
 *   footer  [하트 아이콘] [카운트]                  [더보기 버튼]
 */
export function RetroCardSkeleton() {
  return (
    <article
      className="pt-3 pb-3"
      aria-hidden
    >
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-28 animate-pulse rounded-md bg-neutral-100" />
          <div className="h-5 w-16 animate-pulse rounded-md bg-neutral-100" />
        </div>
        <div className="h-4 w-10 animate-pulse rounded-md bg-neutral-100" />
      </div>

      {/* content lines */}
      <div className="mt-3 flex flex-col gap-2 pb-13">
        <div className="h-4 w-full animate-pulse rounded-md bg-neutral-100" />
        <div className="h-4 w-full animate-pulse rounded-md bg-neutral-100" />
        <div className="h-4 w-3/5 animate-pulse rounded-md bg-neutral-100" />
      </div>

      {/* footer */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="h-7 w-7 animate-pulse rounded-full bg-neutral-100" />
          <div className="h-4 w-6 animate-pulse rounded-md bg-neutral-100" />
        </div>
        <div className="h-7 w-7 animate-pulse rounded-full bg-neutral-100" />
      </div>
    </article>
  );
}
