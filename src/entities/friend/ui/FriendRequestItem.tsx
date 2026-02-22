import { Icon } from "@/shared/ui/icon";

import type { FriendRequestItemVM } from "../model";

import { FriendBaseItem } from "./FriendBaseItem";

interface FriendRequestItemProps {
  vm: FriendRequestItemVM;
}

export function FriendRequestItem({ vm }: FriendRequestItemProps) {
  return (
    <FriendBaseItem
      vm={vm}
      rightSlot={
        <>
          <button
            type="button"
            aria-label={`${vm.nickname} 요청 수락`}
            className="inline-flex h-8 w-8 items-center justify-center text-neutral-700"
          >
            <Icon
              name="comform"
              className="h-6 w-6"
            />
          </button>
          <button
            type="button"
            aria-label={`${vm.nickname} 요청 거절`}
            className="inline-flex h-8 w-8 items-center justify-center text-neutral-700"
          >
            <Icon
              name="reject"
              className="h-6 w-6"
            />
          </button>
        </>
      }
    />
  );
}
