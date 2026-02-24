interface RoomPageProps {
  enabled?: boolean;
}

export function RoomPage({ enabled: _enabled = true }: RoomPageProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-neutral-400">방 기능이 준비 중이에요.</p>
    </div>
  );
}
