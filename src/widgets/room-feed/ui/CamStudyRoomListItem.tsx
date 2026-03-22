import type { CamStudyRoomListItemVM } from "@/entities/cam-study-room-list";
import { getCamStudyStatus } from "@/entities/cam-study-room-status";
import { Icon } from "@/shared/ui/icon";

interface CamStudyRoomListItemProps {
  item: CamStudyRoomListItemVM;
  onClick: (room: CamStudyRoomListItemVM) => void;
}

export function CamStudyRoomListItem({ item, onClick }: CamStudyRoomListItemProps) {
  const status = getCamStudyStatus(item);
  const isDisabled = status.key === "INACTIVE" || status.key === "FULL";

  return (
    <button
      type="button"
      className={`w-full rounded-[20px] border px-6 py-5 text-left ${
        isDisabled
          ? "cursor-not-allowed border-neutral-200 bg-neutral-50"
          : "border-neutral-200 bg-white"
      }`}
      onClick={() => onClick(item)}
      disabled={isDisabled}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${status.dotClassName}`}
            aria-hidden
          />
          <span className="truncate text-[15px] font-semibold text-neutral-900">{item.title}</span>
        </div>
        <span className="shrink-0 text-[13px] font-medium text-neutral-500">{status.label}</span>
      </div>

      <p className="mt-2 line-clamp-2 text-[14px] text-neutral-500">{item.description}</p>

      <div className="mt-3 flex items-center justify-end text-[14px] text-neutral-700">
        <span className="inline-flex items-center gap-1">
          <Icon
            name="user_filled"
            className="h-5 w-5 text-neutral-500"
            aria-hidden
          />
          {item.participantsCount}/{item.maxParticipants}
        </span>
      </div>
    </button>
  );
}
