import { IconButton } from "@/shared/ui/button";

interface ChatRoomHeaderActionsProps {
  isOwner: boolean;
  onMembersClick: () => void;
  onSettingsClick: () => void;
}

export function ChatRoomHeaderActions({
  isOwner,
  onMembersClick,
  onSettingsClick,
}: ChatRoomHeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <IconButton
        icon="user_filled"
        label="그룹원 목록"
        onClick={onMembersClick}
        className="p-0"
        iconClassName="h-7 w-7 text-ink-900 [&>path]:h-[18px] [&>path]:w-[18px]"
      />
      {isOwner ? (
        <IconButton
          icon="more"
          label="채팅방 설정"
          onClick={onSettingsClick}
          className="p-0"
          iconClassName="h-7 w-7 text-ink-900 [&>path]:h-[18px] [&>path]:w-[18px]"
        />
      ) : null}
    </div>
  );
}
