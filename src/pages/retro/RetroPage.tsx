import { RetroFeed } from "@/widgets/retro-feed";

interface RetroPageProps {
  enabled?: boolean;
}

export function RetroPage({ enabled = true }: RetroPageProps) {
  return <RetroFeed enabled={enabled} />;
}
