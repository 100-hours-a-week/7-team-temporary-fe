import type { CamStudyRoomListItemVM } from "@/entities/cam-study-room";
import { EmptyStateCard } from "@/shared/ui/empty";

import { CamStudyRoomListItem } from "./CamStudyRoomListItem";

interface CamStudyRoomListProps {
  items: CamStudyRoomListItemVM[];
  onRoomClick: (room: CamStudyRoomListItemVM) => void;
}

export function CamStudyRoomList({ items, onRoomClick }: CamStudyRoomListProps) {
  if (items.length === 0) {
    return (
      <EmptyStateCard
        message="캠 스터디방이 없습니다."
        className="mt-4"
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.roomId}>
          <CamStudyRoomListItem
            item={item}
            onClick={onRoomClick}
          />
        </li>
      ))}
    </ul>
  );
}
