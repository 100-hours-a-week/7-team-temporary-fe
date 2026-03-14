import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchChatRoomDetail, issueChatRoomWebRtcToken, joinChatRoom } from "@/entities/chat-room";
import type { ChatRoomDetailDto } from "@/entities/chat-room";
import { useLiveKitSession } from "@/entities/cam-study-room";
import { useAuthStore } from "@/entities/user";
import { chatStompSession } from "@/shared/socket";

import type { CamStudyParticipantVM, CamStudyRoomSummary } from "./camStudyRoom.types";

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";

function resolveMyParticipantId(detail: ChatRoomDetailDto, myUserId: number): number | null {
  if (detail.owner.userId === myUserId) {
    return detail.owner.participantId ?? null;
  }
  return (
    detail.participants.find((participant) => participant.userId === myUserId)?.participantId ??
    null
  );
}

function mapDetailToVMs(
  detail: ChatRoomDetailDto,
  myUserId: number,
  myParticipantId: number,
): CamStudyParticipantVM[] {
  const seenUserIds = new Set<number>();

  const entries = [
    {
      participantId: detail.owner.participantId ?? null,
      userId: detail.owner.userId,
      nickname: detail.owner.nickname,
      cameraEnabled: detail.owner.cameraEnabled,
      profileImage: detail.owner.profileImage,
      joinedAt: "",
      isOwner: true,
    },
    ...detail.participants.map((p) => ({ ...p, isOwner: false })),
  ];

  return entries
    .filter(({ userId }) => {
      if (seenUserIds.has(userId)) return false;
      seenUserIds.add(userId);
      return true;
    })
    .map((p) => ({
      userId: p.userId,
      participantId: p.participantId ?? null,
      nickname: p.nickname,
      cameraEnabled: p.cameraEnabled,
      screenVisible: p.cameraEnabled,
      isMe: p.userId === myUserId || p.participantId === myParticipantId,
      profileImageUrl: p.profileImage?.url ?? null,
      joinedAt: p.joinedAt,
      role: p.isOwner ? ("OWNER" as const) : ("PARTICIPANT" as const),
    }));
}

interface UseCamStudyRoomStackPageModelParams {
  roomId: number;
  initialTitle?: string;
  initialSummary?: CamStudyRoomSummary;
  initialParticipantId?: number;
}

export function useCamStudyRoomStackPageModel({
  roomId,
  initialTitle,
  initialSummary,
  initialParticipantId,
}: UseCamStudyRoomStackPageModelParams) {
  const roomTitle = useMemo(() => initialTitle?.trim() || "캠 스터디방", [initialTitle]);
  const myUserId = useAuthStore((state) => state.userId ?? null);

  const [participantId, setParticipantId] = useState<number | null>(null);
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [participants, setParticipants] = useState<CamStudyParticipantVM[]>([]);
  const [maxParticipants, setMaxParticipants] = useState(initialSummary?.maxParticipants ?? 0);
  const [isControlMenuOpen, setIsControlMenuOpen] = useState(false);

  // Step 1: fetch detail → ensure my participantId(필요 시 join) → get token
  useEffect(() => {
    const currentUserId = myUserId;
    if (currentUserId === null) return;
    const resolvedUserId = currentUserId;
    const controller = new AbortController();

    async function init() {
      setParticipantId(null);
      setLivekitToken(null);
      setParticipants([]);

      let detailRes = await fetchChatRoomDetail({ roomId, signal: controller.signal });
      let resolvedParticipantId =
        typeof initialParticipantId === "number" && initialParticipantId > 0
          ? initialParticipantId
          : resolveMyParticipantId(detailRes, resolvedUserId);
      setParticipants(mapDetailToVMs(detailRes, resolvedUserId, resolvedParticipantId ?? -1));
      setMaxParticipants(detailRes.maxParticipants);

      if (resolvedParticipantId === null) {
        const joinRes = await joinChatRoom({ roomId, signal: controller.signal });
        const joinedParticipantId = joinRes.participantId;
        resolvedParticipantId = joinedParticipantId;
        detailRes = await fetchChatRoomDetail({ roomId, signal: controller.signal });
        setParticipants(mapDetailToVMs(detailRes, resolvedUserId, joinedParticipantId));
        setMaxParticipants(detailRes.maxParticipants);
      }

      if (resolvedParticipantId === null) {
        throw new Error("참가자 식별자를 확인할 수 없습니다.");
      }

      setParticipantId(resolvedParticipantId);

      const tokenRes = await issueChatRoomWebRtcToken({
        roomId,
        participantId: resolvedParticipantId,
        signal: controller.signal,
      });

      setLivekitToken(tokenRes.accessToken);
    }

    init().catch((err) => {
      if ((err as { name?: string })?.name !== "AbortError") {
        console.error("[cam-study] init error", err);
      }
    });

    return () => controller.abort();
  }, [initialParticipantId, myUserId, roomId]);

  // Step 2: subscribe to STOMP video events after participantId is ready
  useEffect(() => {
    if (participantId === null) return;

    return chatStompSession.subscribeToRoom({
      roomId,
      participantId,
      onVideoCameraChanged: ({ userId, cameraEnabled }) => {
        setParticipants((prev) =>
          prev.map((p) =>
            p.userId === userId ? { ...p, cameraEnabled, screenVisible: cameraEnabled } : p,
          ),
        );
      },
      onVideoParticipantJoined: ({
        userId,
        participantId: joinedParticipantId,
        nickname,
        cameraEnabled,
        joinedAt,
      }) => {
        setParticipants((prev) => {
          if (prev.some((p) => p.userId === userId)) return prev;
          return [
            ...prev,
            {
              userId,
              participantId: joinedParticipantId,
              nickname,
              cameraEnabled,
              screenVisible: cameraEnabled,
              isMe: false,
              profileImageUrl: null,
              joinedAt,
              role: "PARTICIPANT" as const,
            },
          ];
        });
      },
      onVideoParticipantLeft: ({ userId }) => {
        setParticipants((prev) => prev.filter((p) => p.userId !== userId));
      },
    });
  }, [roomId, participantId]);

  const { localVideoTrack, remoteVideoTracks, publishCamera, unpublishCamera } = useLiveKitSession({
    livekitUrl: LIVEKIT_URL,
    token: livekitToken,
    roomId,
    participantId,
  });

  const isMyCameraEnabled = useMemo(
    () => participants.find((p) => p.isMe)?.cameraEnabled ?? false,
    [participants],
  );

  const summaryCounts = useMemo(
    () => ({
      activeCamParticipantsCount: participants.reduce((n, p) => n + (p.cameraEnabled ? 1 : 0), 0),
      participantsCount: participants.length,
      maxParticipants,
    }),
    [participants, maxParticipants],
  );

  const handleToggleControlMenu = useCallback(() => {
    setIsControlMenuOpen((prev) => !prev);
  }, []);

  const handleToggleMyCamera = useCallback(async () => {
    const nextEnabled = !isMyCameraEnabled;

    // Optimistic update — STOMP event will confirm when it arrives
    setParticipants((prev) =>
      prev.map((p) =>
        p.isMe ? { ...p, cameraEnabled: nextEnabled, screenVisible: nextEnabled } : p,
      ),
    );

    try {
      if (nextEnabled) {
        await publishCamera();
      } else {
        await unpublishCamera();
      }
    } catch (err) {
      // Revert on failure
      console.error("[cam-study] camera toggle error", err);
      setParticipants((prev) =>
        prev.map((p) =>
          p.isMe ? { ...p, cameraEnabled: !nextEnabled, screenVisible: !nextEnabled } : p,
        ),
      );
    }
  }, [isMyCameraEnabled, publishCamera, unpublishCamera]);

  return {
    roomTitle,
    summaryCounts,
    participants,
    isMyCameraEnabled,
    isControlMenuOpen,
    localVideoTrack,
    remoteVideoTracks,
    handleToggleControlMenu,
    handleToggleMyCamera,
  };
}
