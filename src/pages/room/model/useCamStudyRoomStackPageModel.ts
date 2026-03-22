import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  fetchChatRoomDetail,
  fetchVideoParticipantsOnline,
  issueChatRoomWebRtcToken,
  joinChatRoom,
} from "@/entities/chat-room";
import type { ChatRoomDetailDto } from "@/entities/chat-room";
import { useLiveKitSession } from "@/entities/cam-study-room-livekit";
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

  // video.session.synced에서 role 결정 시 사용
  const ownerUserIdRef = useRef<number | null>(null);
  const myUserIdRef = useRef(myUserId);
  useEffect(() => {
    myUserIdRef.current = myUserId;
  });

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
      ownerUserIdRef.current = detailRes.owner.userId;
      let resolvedParticipantId =
        typeof initialParticipantId === "number" && initialParticipantId > 0
          ? initialParticipantId
          : resolveMyParticipantId(detailRes, resolvedUserId);
      setMaxParticipants(detailRes.maxParticipants);

      if (resolvedParticipantId === null) {
        const joinRes = await joinChatRoom({ roomId, signal: controller.signal });
        resolvedParticipantId = joinRes.participantId;
        detailRes = await fetchChatRoomDetail({ roomId, signal: controller.signal });
        setMaxParticipants(detailRes.maxParticipants);
      }

      if (resolvedParticipantId === null) {
        throw new Error("참가자 식별자를 확인할 수 없습니다.");
      }

      // 현재 온라인 참가자 목록 조회
      const onlineRes = await fetchVideoParticipantsOnline({
        roomId,
        signal: controller.signal,
      });

      const onlineList = onlineRes.participants.map((p) => ({
        userId: p.userId,
        participantId: p.participantId,
        nickname: p.nickname,
        cameraEnabled: p.cameraEnabled,
        screenVisible: p.cameraEnabled,
        isMe: p.userId === resolvedUserId,
        profileImageUrl: null,
        joinedAt: p.onlineAt,
        role: p.userId === detailRes.owner.userId ? ("OWNER" as const) : ("PARTICIPANT" as const),
      }));

      // Redis online 목록에 내가 없으면 직접 추가한다.
      // (online 이벤트는 LiveKit 연결 후 전송되므로 GET 시점에 나는 목록에 없을 수 있다.)
      const isMeInList = onlineList.some((p) => p.userId === resolvedUserId);
      if (!isMeInList) {
        const isOwner = detailRes.owner.userId === resolvedUserId;
        const myEntry = isOwner
          ? detailRes.owner
          : detailRes.participants.find((p) => p.userId === resolvedUserId);
        if (myEntry) {
          onlineList.push({
            userId: resolvedUserId,
            participantId: resolvedParticipantId,
            nickname: myEntry.nickname,
            cameraEnabled: myEntry.cameraEnabled,
            screenVisible: myEntry.cameraEnabled,
            isMe: true,
            profileImageUrl: null,
            joinedAt: "joinedAt" in myEntry ? (myEntry.joinedAt as string) : "",
            role: isOwner ? ("OWNER" as const) : ("PARTICIPANT" as const),
          });
        }
      }

      setParticipants(onlineList);

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

    // video.session.synced: POST /video/sessions ACK
    // → 해당 participantId의 published 상태 반영, 본인이면 isMe 확정
    const unsubscribeSessionSynced = chatStompSession.onVideoSessionSynced((payload) => {
      setParticipants((prev) =>
        prev.map((p) => {
          if (p.participantId !== payload.participantId) return p;
          return {
            ...p,
            cameraEnabled: payload.published,
            screenVisible: payload.published,
            isMe: p.isMe || payload.participantId === participantId,
          };
        }),
      );
    });

    const unsubscribeRoom = chatStompSession.subscribeToRoom({
      roomId,
      participantId,
      onVideoParticipantOfflined: ({ userId }) => {
        setParticipants((prev) => prev.filter((p) => p.userId !== userId));
      },
      onVideoParticipantOnlined: ({
        userId,
        participantId: onlinedParticipantId,
        nickname,
        cameraEnabled,
        at,
      }) => {
        setParticipants((prev) => {
          if (prev.some((p) => p.userId === userId)) return prev;
          return [
            ...prev,
            {
              userId,
              participantId: onlinedParticipantId,
              nickname,
              cameraEnabled,
              screenVisible: cameraEnabled,
              isMe: userId === myUserIdRef.current || onlinedParticipantId === participantId,
              profileImageUrl: null,
              joinedAt: at,
              role:
                userId === ownerUserIdRef.current ? ("OWNER" as const) : ("PARTICIPANT" as const),
            },
          ];
        });
      },
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
              isMe: userId === myUserIdRef.current || joinedParticipantId === participantId,
              profileImageUrl: null,
              joinedAt,
              role:
                userId === ownerUserIdRef.current ? ("OWNER" as const) : ("PARTICIPANT" as const),
            },
          ];
        });
      },
      onVideoParticipantLeft: ({ userId }) => {
        setParticipants((prev) => prev.filter((p) => p.userId !== userId));
      },
    });

    return () => {
      unsubscribeSessionSynced();
      unsubscribeRoom();
    };
  }, [roomId, participantId]);

  const {
    localVideoTrack,
    remoteVideoTracks,
    isConnected: isLivekitConnected,
    publishCamera,
    unpublishCamera,
  } = useLiveKitSession({
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
    isLivekitConnected,
    isControlMenuOpen,
    localVideoTrack,
    remoteVideoTracks,
    handleToggleControlMenu,
    handleToggleMyCamera,
  };
}
