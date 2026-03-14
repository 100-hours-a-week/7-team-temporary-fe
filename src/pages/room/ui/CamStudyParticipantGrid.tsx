import { useEffect, useRef } from "react";
import type { LocalVideoTrack, RemoteVideoTrack } from "livekit-client";

import { cn } from "@/shared/lib";
import { Icon } from "@/shared/ui/icon";

import type { CamStudyParticipantVM } from "../model/camStudyRoom.types";

interface CamStudyParticipantGridProps {
  participants: CamStudyParticipantVM[];
  localVideoTrack: LocalVideoTrack | null;
  remoteVideoTracks: Map<string, RemoteVideoTrack>;
}

export function CamStudyParticipantGrid({
  participants,
  localVideoTrack,
  remoteVideoTracks,
}: CamStudyParticipantGridProps) {
  return (
    <ul className="mt-3 grid grid-cols-3 gap-3 pb-24 sm:grid-cols-4">
      {participants.map((participant) => (
        <li
          key={`${participant.role}-${participant.userId}`}
          className="overflow-hidden rounded-2xl"
        >
          <ParticipantCell
            participant={participant}
            localVideoTrack={localVideoTrack}
            remoteVideoTracks={remoteVideoTracks}
          />
        </li>
      ))}
    </ul>
  );
}

function ParticipantCell({
  participant,
  localVideoTrack,
  remoteVideoTracks,
}: {
  participant: CamStudyParticipantVM;
  localVideoTrack: LocalVideoTrack | null;
  remoteVideoTracks: Map<string, RemoteVideoTrack>;
}) {
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

  const track = participant.isMe
    ? localVideoTrack
    : (remoteVideoTracks.get(String(participant.participantId ?? participant.userId)) ?? null);

  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden",
        participant.screenVisible && "bg-neutral-900",
      )}
    >
      {participant.screenVisible ? (
        <ActiveCamScreen
          participant={participant}
          track={track}
        />
      ) : (
        <CamOnScreenOff participant={participant} />
      )}
    </div>
  );
}

function ActiveCamScreen({
  participant,
  track,
}: {
  participant: CamStudyParticipantVM;
  track: LocalVideoTrack | RemoteVideoTrack | null;
}) {
  return (
    <>
      {track ? (
        <VideoTrackRenderer
          track={track}
          label={`${participant.nickname} 캠 화면`}
        />
      ) : (
        <div className="h-full w-full bg-neutral-900" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pt-8 pb-2">
        <span className="block truncate text-xs font-medium text-white">
          {participant.nickname}
        </span>
      </div>
    </>
  );
}

function VideoTrackRenderer({
  track,
  label,
}: {
  track: LocalVideoTrack | RemoteVideoTrack;
  label: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [track]);

  return (
    <video
      ref={ref}
      autoPlay
      muted
      playsInline
      aria-label={label}
      className="h-full w-full object-cover"
    />
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
