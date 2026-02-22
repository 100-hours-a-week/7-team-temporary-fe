import type { PublicRetroCardVM } from "@/entities/retro";
import { RetroListItemCard } from "@/features/retro";
import { EmptyStateCard } from "@/shared/ui";
import { PublicPageHeader } from "@/widgets/public-page-header";

interface RetroPublicFeedProps {
  retros: PublicRetroCardVM[];
}

export function RetroPublicFeed({ retros }: RetroPublicFeedProps) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <PublicPageHeader title="회고" />
      <section className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6">
        {retros.length === 0 ? (
          <EmptyStateCard
            message="공개된 회고가 없습니다."
            className="mt-4 bg-white"
          />
        ) : (
          <ul>
            {retros.map((retro) => (
              <li key={retro.id}>
                <RetroListItemCard vm={retro} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
