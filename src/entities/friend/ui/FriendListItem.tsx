import { Icon } from "@/shared/ui/icon";

import type { FriendListItemVM } from "../model";
import { FriendBaseItem } from "./FriendBaseItem";

interface FriendListItemProps {
  vm: FriendListItemVM;
}

export function FriendListItem({ vm }: FriendListItemProps) {
  return (
    <FriendBaseItem
      vm={vm}
      rightSlot={
        <>
          <button
            type="button"
            aria-label={`${vm.nickname} 채팅`}
            className="inline-flex h-8 w-8 items-center justify-center text-neutral-700"
          >
            <Icon
              name="chat_single"
              className="h-6 w-6"
            />
          </button>
          <button
            type="button"
            aria-label={`${vm.nickname} 삭제`}
            className="inline-flex h-8 w-8 items-center justify-center text-neutral-700"
          >
            <Icon
              name="user_delete"
              className="h-6 w-6"
            />
          </button>
        </>
      }
    />
  );
}
