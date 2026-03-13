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
    const room = roomRef.current;
    if (!room || !isConnected || participantId === null) return;

    const track = await createLocalVideoTrack();
    await room.localParticipant.publishTrack(track);
    localTrackRef.current = track;
    setLocalVideoTrack(track);

    await Promise.all([
      updateChatRoomParticipantCameraStatus({ participantId, cameraEnabled: true }),
      syncChatRoomVideoSession({ roomId, participantId, sessionId: room.name, published: true }),
    ]);
  }, [isConnected, participantId, roomId]);

  const unpublishCamera = useCallback(async () => {
    const room = roomRef.current;
    const track = localTrackRef.current;
    if (!room || !track || participantId === null) return;

    await room.localParticipant.unpublishTrack(track);
    track.stop();
    localTrackRef.current = null;
    setLocalVideoTrack(null);

    await Promise.all([
      updateChatRoomParticipantCameraStatus({ participantId, cameraEnabled: false }),
      syncChatRoomVideoSession({ roomId, participantId, sessionId: room.name, published: false }),
    ]);
  }, [participantId, roomId]);

  return { localVideoTrack, remoteVideoTracks, isConnected, publishCamera, unpublishCamera };
}
