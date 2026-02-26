import { Icon } from "@/shared/ui/icon";

import type { FriendRequestItemVM } from "../model";

import { FriendBaseItem } from "./FriendBaseItem";

interface FriendRequestItemProps {
  vm: FriendRequestItemVM;
  onAccept?: (requestId: number) => void;
  onReject?: (requestId: number) => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
}

export function FriendRequestItem({
  vm,
  onAccept,
  onReject,
  isAccepting = false,
  isRejecting = false,
}: FriendRequestItemProps) {
  const isActionPending = isAccepting || isRejecting;

  return (
    <FriendBaseItem
      vm={vm}
      rightSlot={
        <>
          <button
            type="button"
            aria-label={`${vm.nickname} 요청 수락`}
            disabled={isActionPending}
            onClick={() => onAccept?.(vm.requestId)}
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
            onClick={() => onReject?.(vm.requestId)}
            disabled={isActionPending}
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
