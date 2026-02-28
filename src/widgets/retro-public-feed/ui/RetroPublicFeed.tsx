import type { PublicRetroListModel } from "@/entities/retro";
import { PublicPageHeader } from "@/widgets/public-page-header";

import { RetroPublicFeedList } from "./RetroPublicFeedList";

interface RetroPublicFeedProps {
  initialList: PublicRetroListModel;
}

export function RetroPublicFeed({ initialList }: RetroPublicFeedProps) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <PublicPageHeader title="회고" />
      <RetroPublicFeedList initialList={initialList} />
    </div>
  );
}
