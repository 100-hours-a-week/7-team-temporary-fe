import { IconButton } from "@/shared/ui/button";

import { HeaderFrame } from "@/widgets/app-header/ui/HeaderFrame";

interface AppHeaderProps {
  title: string;
  onNotificationClick?: () => void;
}

export function AppHeader({ title, onNotificationClick }: AppHeaderProps) {
  return (
    <HeaderFrame
      leftSlot={<span className="text-ink-900 text-xl font-semibold">{title}</span>}
      rightSlot={
        <IconButton
          icon="notification"
          label="알림"
          onClick={onNotificationClick}
          className="p-0"
          iconClassName="h-7 w-7 text-ink-900 [&>path]:h-[18px] [&>path]:w-[18px]"
        />
      }
    />
  );
}
