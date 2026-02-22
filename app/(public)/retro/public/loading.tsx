import { PublicPageHeader } from "@/widgets/public-page-header";

export default function Loading() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <PublicPageHeader title="회고" />
      <section className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6">
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
          회고를 불러오는 중...
        </div>
      </section>
    </div>
  );
}
