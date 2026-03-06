import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { fetchPublicRetroById, toPublicRetroCardVM } from "@/entities/retro";
import { PublicPageHeader } from "@/widgets/public-page-header";

import { RetroShareContent } from "./RetroShareContent";

export const dynamic = "force-dynamic";

interface RetroSharePageProps {
  params: Promise<{ retroId: string }>;
}

async function getRetroItem(retroId: number) {
  const dto = await fetchPublicRetroById(retroId);
  if (dto.isOpen === false) return null;
  return toPublicRetroCardVM(dto);
}

export async function generateMetadata({ params }: RetroSharePageProps): Promise<Metadata> {
  const { retroId } = await params;
  const id = Number(retroId);

  if (Number.isNaN(id)) return { title: "MOLIP 회고" };

  try {
    const vm = await getRetroItem(id);
    if (!vm) return { title: "MOLIP 회고" };

    const description = vm.content.slice(0, 100);
    const ogImage = vm.imageUrls[0];

    return {
      title: `${vm.dateLabel} 회고 | ${vm.authorNickname}`,
      description,
      openGraph: {
        title: `${vm.dateLabel} 회고 | ${vm.authorNickname}`,
        description,
        ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      },
    };
  } catch {
    return { title: "MOLIP 회고" };
  }
}

export default async function RetroSharePage({ params }: RetroSharePageProps) {
  const { retroId } = await params;
  const id = Number(retroId);

  if (Number.isNaN(id)) {
    notFound();
  }

  let vm;
  try {
    vm = await getRetroItem(id);
  } catch {
    notFound();
  }

  if (!vm) {
    notFound();
  }

  return (
    <div className="flex h-full w-full flex-col">
      <PublicPageHeader title="회고" />
      <div className="min-h-0 flex-1">
        <RetroShareContent vm={vm} />
      </div>
    </div>
  );
}
