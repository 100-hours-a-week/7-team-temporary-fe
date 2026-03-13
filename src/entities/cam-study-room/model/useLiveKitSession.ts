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

  useEffect(() => {
    if (!token || !livekitUrl) return;

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
      .then(() => {
        if (!active) return;
        setIsConnected(true);
      })
      .catch((err) => {
        if (active) console.error("[livekit] connect error", err);
      });

    return () => {
      active = false;
      localTrackRef.current?.stop();
      localTrackRef.current = null;
      setLocalVideoTrack(null);
      setIsConnected(false);
      setRemoteVideoTracks(new Map());
      room.disconnect();
      roomRef.current = null;
    };
  }, [token, livekitUrl]);

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
      syncChatRoomVideoSession({ roomId, participantId, sessionId: room.name, published: true }),
    ]);
  }, [isConnected, participantId, roomId]);

  const unpublishCamera = useCallback(async () => {
    const track = localTrackRef.current;
    if (!track || participantId === null) return;

    // LiveKit publish 해제 (연결된 경우)
    const room = roomRef.current;
    if (room && isConnected) {
      await room.localParticipant.unpublishTrack(track);
      await Promise.all([
        updateChatRoomParticipantCameraStatus({ participantId, cameraEnabled: false }),
        syncChatRoomVideoSession({ roomId, participantId, sessionId: room.name, published: false }),
      ]);
    }

    track.stop();
    localTrackRef.current = null;
    setLocalVideoTrack(null);
  }, [isConnected, participantId, roomId]);

  return { localVideoTrack, remoteVideoTracks, isConnected, publishCamera, unpublishCamera };
}
