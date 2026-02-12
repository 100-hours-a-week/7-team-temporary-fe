import { EXPLORE_RETRO_MOCKS } from "@/entities/retro";
import { RetroPublicFeed } from "@/widgets/retro-public-feed";

export const revalidate = 60;

async function getPublicRetros() {
  // TODO: 공개 회고 조회 API 연동 후 서버 패칭으로 교체
  return EXPLORE_RETRO_MOCKS;
}

export default async function Page() {
  const retros = await getPublicRetros();
  return <RetroPublicFeed retros={retros} />;
}
