import { useCallback, useEffect, useRef, useState } from "react";
import { createLocalVideoTrack, Room, RoomEvent, Track } from "livekit-client";
import type { LocalVideoTrack, RemoteVideoTrack } from "livekit-client";

import {
  syncChatRoomVideoSession,
  updateChatRoomParticipantCameraStatus,
} from "@/entities/chat-room";

interface UseLiveKitSessionParams {
  livekitUrl: string;
  token: string | null;
  roomId: number;
  participantId: number | null;
}

export function useLiveKitSession({
  livekitUrl,
  token,
  roomId,
  participantId,
}: UseLiveKitSessionParams) {
  const roomRef = useRef<Room | null>(null);
  const localTrackRef = useRef<LocalVideoTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [remoteVideoTracks, setRemoteVideoTracks] = useState<Map<string, RemoteVideoTrack>>(
    () => new Map(),
  );
  const [isConnected, setIsConnected] = useState(false);

  const syncVideoSession = useCallback(
    async (published: boolean) => {
      if (participantId === null) return;
      const room = roomRef.current;
      if (!room || !room.name) return;

      await syncChatRoomVideoSession({
        roomId,
        participantId,
        sessionId: room.name,
        published,
      });
    },
    [participantId, roomId],
  );

  useEffect(() => {
    if (!token || !livekitUrl || participantId === null) return;

    let active = true;
    const room = new Room();
    roomRef.current = room;

    room.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
      if (track.kind !== Track.Kind.Video) return;
      setRemoteVideoTracks((prev) => {
        const next = new Map(prev);
        next.set(participant.identity, track as RemoteVideoTrack);
        return next;
      });
    });

    room.on(RoomEvent.TrackUnsubscribed, (_track, _pub, participant) => {
      setRemoteVideoTracks((prev) => {
        const next = new Map(prev);
        next.delete(participant.identity);
        return next;
      });
    });

    room
      .connect(livekitUrl, token)
      .then(async () => {
        if (!active) return;
        setIsConnected(true);
        // 입장 직후 세션 스냅샷 대상에 포함되도록 비디오 세션을 등록한다.
        await syncVideoSession(false);
      })
      .catch((err) => {
        if (active) console.error("[livekit] connect error", err);
      });

    return () => {
      active = false;
      void syncVideoSession(false).catch((err) => {
        console.warn("[livekit] session sync on cleanup failed", err);
      });
      localTrackRef.current?.stop();
      localTrackRef.current = null;
      setLocalVideoTrack(null);
      setIsConnected(false);
      setRemoteVideoTracks(new Map());
      room.disconnect();
      roomRef.current = null;
    };
  }, [livekitUrl, participantId, syncVideoSession, token]);

  const publishCamera = useCallback(async () => {
    if (participantId === null) return;

    // 카메라 캡처는 LiveKit 연결 여부와 무관하게 즉시 실행
    const track = await createLocalVideoTrack();
    localTrackRef.current = track;
    setLocalVideoTrack(track);

    // LiveKit 연결된 경우에만 publish + 백엔드 통보
    const room = roomRef.current;
    if (!room || !isConnected) return;

    await room.localParticipant.publishTrack(track);
    await Promise.all([
      updateChatRoomParticipantCameraStatus({ participantId, cameraEnabled: true }),
      syncVideoSession(true),
    ]);
  }, [isConnected, participantId, syncVideoSession]);

  const unpublishCamera = useCallback(async () => {
    const track = localTrackRef.current;
    if (!track || participantId === null) return;

    // LiveKit publish 해제 (연결된 경우)
    const room = roomRef.current;
    if (room && isConnected) {
      await room.localParticipant.unpublishTrack(track);
      await Promise.all([
        updateChatRoomParticipantCameraStatus({ participantId, cameraEnabled: false }),
        syncVideoSession(false),
      ]);
    }

    track.stop();
    localTrackRef.current = null;
    setLocalVideoTrack(null);
  }, [isConnected, participantId, syncVideoSession]);

  return { localVideoTrack, remoteVideoTracks, isConnected, publishCamera, unpublishCamera };
}
