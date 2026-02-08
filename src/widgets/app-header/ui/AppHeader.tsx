import { IconButton } from "@/shared/ui/button";

import { HeaderFrame } from "./HeaderFrame";

interface AppHeaderProps {
  title: string;
  onNotificationClick?: () => void;
  onReportClick?: () => void;
}

export function AppHeader({ title, onNotificationClick, onReportClick }: AppHeaderProps) {
  return (
    <HeaderFrame
      leftSlot={<span className="text-ink-900 text-xl font-semibold">{title}</span>}
      rightSlot={
        <div className="flex flex-row items-center gap-2">
          <IconButton
            icon="siren"
            label="신고"
            onClick={onReportClick}
            className="p-0"
            iconClassName="h-5 w-5 text-primary-600 [&>path]:h-[18px] [&>path]:w-[18px]"
          />
          <IconButton
            icon="notification"
            label="알림"
            onClick={onNotificationClick}
            className="p-0"
            iconClassName="h-7 w-7 text-ink-900 [&>path]:h-[18px] [&>path]:w-[18px]"
          />
        </div>
      }
    />
  );
}
