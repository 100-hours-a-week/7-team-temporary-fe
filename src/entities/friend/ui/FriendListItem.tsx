import { useState } from "react";

import { ConfirmDialog } from "@/shared/ui/dialogs";
import { Icon } from "@/shared/ui/icon";

import type { FriendListItemVM } from "../model";
import { FriendBaseItem } from "./FriendBaseItem";

interface FriendListItemProps {
  vm: FriendListItemVM;
  onDelete?: (friendUserId: number) => void;
  onChat?: (friendUserId: number) => void;
  isDeleting?: boolean;
  isChatting?: boolean;
}

export function FriendListItem({
  vm,
  onDelete,
  onChat,
  isDeleting = false,
  isChatting = false,
}: FriendListItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteConfirm = () => {
    setIsDeleteDialogOpen(false);
    onDelete?.(vm.id);
  };

  return (
    <FriendBaseItem
      vm={vm}
      rightSlot={
        <>
          <button
            type="button"
            aria-label={`${vm.nickname} 채팅`}
            className="inline-flex h-8 w-8 items-center justify-center text-neutral-700"
            onClick={() => onChat?.(vm.id)}
            disabled={isChatting}
          >
            <Icon
              name="chat_single"
              className="h-6 w-6"
            />
          </button>
          <ConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title={
              <>
                {vm.nickname} 님을
                <br />
                친구에서 삭제하시겠습니까?
              </>
            }
            confirmText="삭제하기"
            cancelText="취소"
            onConfirm={handleDeleteConfirm}
            confirmDisabled={isDeleting}
            cancelDisabled={isDeleting}
            trigger={
              <button
                type="button"
                aria-label={`${vm.nickname} 삭제`}
                className="inline-flex h-8 w-8 items-center justify-center text-neutral-700"
                disabled={isDeleting}
              >
                <Icon
                  name="user_delete"
                  className="h-6 w-6"
                />
              </button>
            }
          />
        </>
      }
    />
  );
}
