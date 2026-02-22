import {
  fetchPublicRetros,
  toPublicRetroListModel,
  type PublicRetroCardVM,
} from "@/entities/retro";
import { RetroPublicFeed } from "@/widgets/retro-public-feed";

export const revalidate = 60;

const PUBLIC_RETRO_PAGE = 1;
const PUBLIC_RETRO_SIZE = 10;

async function getPublicRetros(): Promise<PublicRetroCardVM[]> {
  try {
    const dto = await fetchPublicRetros({
      isOpen: true,
      page: PUBLIC_RETRO_PAGE,
      size: PUBLIC_RETRO_SIZE,
    });

    return toPublicRetroListModel(dto).content;
  } catch (error) {
    console.error("[retro/public] 공개 회고 조회 실패", error);
    return [];
  }
}

export default async function Page() {
  const retros = await getPublicRetros();
  return <RetroPublicFeed retros={retros} />;
}
