import { cn } from "@/shared/lib";
import { Icon } from "@/shared/ui/icon";

import type { CamStudyParticipantVM } from "../model/camStudyRoom.types";

interface CamStudyParticipantGridProps {
  participants: CamStudyParticipantVM[];
}

export function CamStudyParticipantGrid({ participants }: CamStudyParticipantGridProps) {
  return (
    <ul className="mt-3 grid grid-cols-3 gap-3 pb-24 sm:grid-cols-4">
      {participants.map((participant) => (
        <li
          key={`${participant.role}-${participant.userId}`}
          className="overflow-hidden rounded-2xl"
        >
          <ParticipantCell participant={participant} />
        </li>
      ))}
    </ul>
  );
}

function ParticipantCell({ participant }: { participant: CamStudyParticipantVM }) {
  if (!participant.cameraEnabled) {
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-2 px-2">
        <Icon
          name="user_outline"
          className="h-14 w-14 text-neutral-400"
          aria-label="캠 비활성 사용자"
        />
        <span className="line-clamp-2 text-center text-sm font-medium text-neutral-400">
          {participant.nickname}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden",
        participant.screenVisible && "bg-neutral-900",
      )}
    >
      {participant.screenVisible ? (
        <ActiveCamScreen participant={participant} />
      ) : (
        <CamOnScreenOff participant={participant} />
      )}
    </div>
  );
}

function ActiveCamScreen({ participant }: { participant: CamStudyParticipantVM }) {
  return (
    <>
      {participant.profileImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={participant.profileImageUrl}
          alt={`${participant.nickname} 캠 화면`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-neutral-800 text-xs font-semibold text-white/80">
          캠 화면
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pt-8 pb-2">
        <span className="block truncate text-xs font-medium text-white">
          {participant.nickname}
        </span>
      </div>
    </>
  );
}

function CamOnScreenOff({ participant }: { participant: CamStudyParticipantVM }) {
  return (
    <div className="flex h-full flex-col items-center justify-between px-2 py-3">
      <div className="flex flex-1 items-center justify-center">
        <Icon
          name="user_outline"
          className="h-14 w-14 text-neutral-400"
          aria-label="화면 끔 사용자"
        />
      </div>
      <span className="line-clamp-2 text-center text-sm font-medium text-neutral-400">
        {participant.nickname}
      </span>
    </div>
  );
}
