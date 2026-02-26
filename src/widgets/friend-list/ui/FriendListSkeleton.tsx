import { FRIEND_LIST_SECTION_TITLE, FRIEND_REQUEST_SECTION_TITLE } from "../model/constants";

const REQUEST_SKELETON_COUNT = 2;
const FRIEND_SKELETON_COUNT = 6;

export function FriendListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-neutral-500">
          {FRIEND_REQUEST_SECTION_TITLE}
        </h2>
        <ul className="flex flex-col gap-3">
          {Array.from({ length: REQUEST_SKELETON_COUNT }).map((_, index) => (
            <li
              key={`request-skeleton-${index}`}
              className="rounded-2xl border border-neutral-100 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-100" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-3 w-24 animate-pulse rounded-full bg-neutral-100" />
                  <div className="h-3 w-32 animate-pulse rounded-full bg-neutral-100" />
                </div>
                <div className="h-7 w-14 animate-pulse rounded-md bg-neutral-100" />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-neutral-500">
          {FRIEND_LIST_SECTION_TITLE}
        </h2>
        <ul className="flex flex-col gap-3">
          {Array.from({ length: FRIEND_SKELETON_COUNT }).map((_, index) => (
            <li
              key={`friend-skeleton-${index}`}
              className="rounded-2xl border border-neutral-100 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-100" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-3 w-20 animate-pulse rounded-full bg-neutral-100" />
                  <div className="h-3 w-28 animate-pulse rounded-full bg-neutral-100" />
                </div>
                <div className="h-7 w-12 animate-pulse rounded-md bg-neutral-100" />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
