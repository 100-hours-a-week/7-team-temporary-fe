import { RetroCardSkeleton } from "@/entities/retro";
import { PublicPageHeader } from "@/widgets/public-page-header";

export default function Loading() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <PublicPageHeader title="회고" />
      <section className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6">
        <ul
          aria-busy
          aria-label="회고를 불러오는 중"
        >
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i}>
              <RetroCardSkeleton />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
