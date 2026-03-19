"use client";

import { Client, type IFrame, type StompSubscription } from "@stomp/stompjs";

import { ApiError, apiFetch, Endpoint, getXsrfToken } from "@/shared/api";
import { AuthService, getDeviceId, setAuthUserId } from "@/shared/auth";
import {
  parseConnectedErrorCode,
  parseConnectedSuccessPayload,
  toStompHeaderErrorCode,
} from "./model/connectedMessage";
import type {
  DisconnectHandshakePayload,
  LastSeenUpdatePayload,
  MessageCreatedPayload,
  MessageDuplicatePayload,
  MessageSendAcceptedPayload,
  MessageSendFailedPayload,
  MessageSendPayload,
  MessageSendRejectedPayload,
  ParticipantJoinedPayload,
  ParticipantLeftPayload,
  ReportMessageSendAcceptedPayload,
  ReportMessageCreatedPayload,
  ReportMessageSendFailedPayload,
  ReportMessageSendPayload,
  ReportMessageSendRejectedPayload,
  ReportStreamStartPayload,
  ReportStreamChunkPayload,
  ReportStreamEndPayload,
  SocketReconnectRequiredPayload,
  SocketResyncRequiredPayload,
  SocketServerDisconnectPayload,
  SubscribedUserEventPayload,
  SubscribeRoomRequestPayload,
  SubscribeUserRequestPayload,
  UnreadChangedUserEventPayload,
  UnsubscribeRoomRequestPayload,
  VideoCameraChangedPayload,
  VideoCameraToggleAcceptedPayload,
  VideoParticipantOnlinedPayload,
  VideoParticipantOfflinedPayload,
  VideoParticipantJoinedPayload,
  VideoParticipantLeftPayload,
  VideoPublishStartedPayload,
  VideoParticipantHeartbeatPayload,
  VideoParticipantOfflinePayload,
  VideoParticipantOnlinePayload,
  VideoPublishStoppedPayload,
  VideoRoomDeletedPayload,
  VideoSessionSyncedPayload,
  VideoTokenIssuedPayload,
} from "./model/handshake.types";
import {
  resolveChatSocketDisconnectDestination,
  resolveChatSocketStartConfig,
  type ChatSocketStartConfig,
} from "./model/socketEnv";
import {
  chatSocketError,
  chatSocketLog,
  chatSocketWarn,
  resolveStompDebugLogger,
} from "./model/socketLogger";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_LOGOUT_DISCONNECT_PAYLOAD: DisconnectHandshakePayload = {
  code: "LOGOUT",
  message: "로그아웃으로 연결을 종료합니다.",
};

const PUBLISH_RECEIPT_TIMEOUT_MS = 3000;
const DUPLICATE_RECONNECT_BASE_DELAY_MS = 1000;
const DUPLICATE_RECONNECT_MAX_DELAY_MS = 8000;
const DUPLICATE_RECONNECT_MAX_RETRIES = 8;
const REPORT_MESSAGE_ACK_TIMEOUT_MS = 5000;

interface SendMessageFallbackRequestDto {
  idempotencyKey: string;
  messageType: MessageSendPayload["messageType"];
  content: string | null;
  imageKeys: string[];
}

interface SendMessageFallbackResponseDto {
  messageId?: number;
  status?: string;
  sentAt?: string;
}

interface LastSeenUpdateFallbackRequestDto {
  lastSeenMessageId: number;
}

interface ReportMessageFallbackRequestDto {
  inputMessage: string;
}

// ─── Listener types ───────────────────────────────────────────────────────────

type UnreadChangedListener = (payload: UnreadChangedUserEventPayload) => void;
type MessageSendAcceptedListener = (payload: MessageSendAcceptedPayload) => void;
type MessageSendRejectedListener = (payload: MessageSendRejectedPayload) => void;
type MessageSendFailedListener = (payload: MessageSendFailedPayload) => void;
type ReportMessageSendAcceptedListener = (payload: ReportMessageSendAcceptedPayload) => void;
type ReportMessageCreatedListener = (payload: ReportMessageCreatedPayload) => void;
type ReportMessageSendRejectedListener = (payload: ReportMessageSendRejectedPayload) => void;
type ReportMessageSendFailedListener = (payload: ReportMessageSendFailedPayload) => void;
type ReportStreamStartListener = (payload: ReportStreamStartPayload) => void;
type ReportStreamChunkListener = (payload: ReportStreamChunkPayload) => void;
type ReportStreamEndListener = (payload: ReportStreamEndPayload) => void;
type SocketResyncRequiredListener = (payload: SocketResyncRequiredPayload) => void;
type VideoSessionSyncedListener = (payload: VideoSessionSyncedPayload) => void;
type VideoCameraToggleAcceptedListener = (payload: VideoCameraToggleAcceptedPayload) => void;
type VideoTokenIssuedListener = (payload: VideoTokenIssuedPayload) => void;

// ─── Room subscription types ──────────────────────────────────────────────────

export interface SubscribeToRoomParams {
  roomId: number;
  participantId?: number;
  onMessageCreated?: (payload: MessageCreatedPayload) => void;
  onParticipantJoined?: (payload: ParticipantJoinedPayload) => void;
  onParticipantLeft?: (payload: ParticipantLeftPayload) => void;
  onVideoCameraChanged?: (payload: VideoCameraChangedPayload) => void;
  onVideoPublishStarted?: (payload: VideoPublishStartedPayload) => void;
  onVideoPublishStopped?: (payload: VideoPublishStoppedPayload) => void;
  onVideoParticipantOnlined?: (payload: VideoParticipantOnlinedPayload) => void;
  onVideoParticipantOfflined?: (payload: VideoParticipantOfflinedPayload) => void;
  onVideoParticipantJoined?: (payload: VideoParticipantJoinedPayload) => void;
  onVideoParticipantLeft?: (payload: VideoParticipantLeftPayload) => void;
  onVideoRoomDeleted?: (payload: VideoRoomDeletedPayload) => void;
}

interface ActiveRoomEntry {
  participantId: number;
  stompSubscription: StompSubscription | null;
  onMessageCreated?: (payload: MessageCreatedPayload) => void;
  onParticipantJoined?: (payload: ParticipantJoinedPayload) => void;
  onParticipantLeft?: (payload: ParticipantLeftPayload) => void;
  onVideoCameraChanged?: (payload: VideoCameraChangedPayload) => void;
  onVideoPublishStarted?: (payload: VideoPublishStartedPayload) => void;
  onVideoPublishStopped?: (payload: VideoPublishStoppedPayload) => void;
  onVideoParticipantOnlined?: (payload: VideoParticipantOnlinedPayload) => void;
  onVideoParticipantOfflined?: (payload: VideoParticipantOfflinedPayload) => void;
  onVideoParticipantJoined?: (payload: VideoParticipantJoinedPayload) => void;
  onVideoParticipantLeft?: (payload: VideoParticipantLeftPayload) => void;
  onVideoRoomDeleted?: (payload: VideoRoomDeletedPayload) => void;
}

interface LastSeenProgress {
  latestRequestedMessageId: number;
  latestConfirmedMessageId: number;
}

interface PendingReportSendRequest {
  payload: ReportMessageSendPayload;
  resolve: () => void;
  reject: (error: Error) => void;
  ackTimeoutId: number | null;
  fallbackTriggered: boolean;
  settled: boolean;
}

// ─── Envelope parsing ─────────────────────────────────────────────────────────

interface EventEnvelope {
  event?: string;
  payload?: unknown;
}

function parseJsonBody(rawBody: string): unknown | null {
  try {
    return JSON.parse(rawBody.replace(/\u0000/g, ""));
  } catch {
    return null;
  }
}

function parseEventEnvelope(rawBody: string): { event: string | null; payload: unknown } | null {
  const parsed = parseJsonBody(rawBody);
  if (!parsed || typeof parsed !== "object") return null;
  const envelope = parsed as EventEnvelope;
  return {
    event: typeof envelope.event === "string" ? envelope.event : null,
    payload: envelope.payload ?? parsed,
  };
}

// ─── Payload parsers ──────────────────────────────────────────────────────────

function toSubscribedUserPayload(candidate: unknown): SubscribedUserEventPayload | null {
  if (!candidate || typeof candidate !== "object") return null;
  const value = candidate as Partial<SubscribedUserEventPayload>;
  if (typeof value.userId === "number" && typeof value.subscribedAt === "string") {
    return { userId: value.userId, subscribedAt: value.subscribedAt };
  }
  return null;
}

function parseSubscribedUserPayload(rawBody: string): SubscribedUserEventPayload | null {
  const parsed = parseJsonBody(rawBody);
  if (!parsed) return null;
  const topLevel = toSubscribedUserPayload(parsed);
  if (topLevel) return topLevel;
  if (typeof parsed !== "object") return null;
  return toSubscribedUserPayload((parsed as { payload?: unknown }).payload);
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeEventName(event: string | null) {
  if (!event) return null;
  return event.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function isUserQueueEvent(event: string | null, expected: string) {
  const normalized = normalizeEventName(event);
  if (!normalized) return true;
  return normalized === normalizeEventName(expected);
}

function isExactSocketEvent(event: string | null, expected: string) {
  const normalized = normalizeEventName(event);
  if (!normalized) return false;
  return normalized === normalizeEventName(expected);
}

function toReportMessageErrorPayload(
  candidate: unknown,
): ReportMessageSendRejectedPayload | ReportMessageSendFailedPayload | null {
  if (!candidate || typeof candidate !== "object") return null;
  const value = candidate as {
    code?: unknown;
    message?: unknown;
    retryable?: unknown;
  };
  if (typeof value.code !== "string" || typeof value.message !== "string") return null;
  return {
    code: value.code,
    message: value.message,
    retryable: typeof value.retryable === "boolean" ? value.retryable : false,
  };
}

function toReportStreamChunkPayload(candidate: unknown): ReportStreamChunkPayload | null {
  if (!candidate || typeof candidate !== "object") return null;
  const value = candidate as {
    reportId?: unknown;
    messageId?: unknown;
    senderType?: unknown;
    messageType?: unknown;
    delta?: unknown;
    sequence?: unknown;
  };
  const reportId = toNumber(value.reportId);
  const messageId = toNumber(value.messageId);
  const sequence = toNumber(value.sequence);
  if (reportId === null || messageId === null || sequence === null) return null;
  if (value.senderType !== "USER" && value.senderType !== "AI" && value.senderType !== "SYSTEM") {
    return null;
  }
  if (value.messageType !== "TEXT" && value.messageType !== "IMAGE") return null;
  if (typeof value.delta !== "string") return null;

  return {
    reportId,
    messageId,
    senderType: value.senderType,
    messageType: value.messageType,
    delta: value.delta,
    sequence,
  };
}

function toReportStreamStartPayload(candidate: unknown): ReportStreamStartPayload | null {
  if (!candidate || typeof candidate !== "object") return null;
  const value = candidate as {
    reportId?: unknown;
    messageId?: unknown;
    senderType?: unknown;
    messageType?: unknown;
    status?: unknown;
  };
  const reportId = toNumber(value.reportId);
  const messageId = toNumber(value.messageId);
  if (reportId === null || messageId === null) return null;
  if (value.senderType !== "USER" && value.senderType !== "AI" && value.senderType !== "SYSTEM") {
    return null;
  }
  if (value.messageType !== "TEXT" && value.messageType !== "IMAGE") return null;

  return {
    reportId,
    messageId,
    senderType: value.senderType,
    messageType: value.messageType,
    status: typeof value.status === "string" ? value.status : undefined,
  };
}

function toReportStreamEndPayload(candidate: unknown): ReportStreamEndPayload | null {
  if (!candidate || typeof candidate !== "object") return null;
  const value = candidate as {
    reportId?: unknown;
    messageId?: unknown;
    senderType?: unknown;
    messageType?: unknown;
    status?: unknown;
    content?: unknown;
  };
  const reportId = toNumber(value.reportId);
  const messageId = toNumber(value.messageId);
  if (reportId === null || messageId === null) return null;
  if (value.senderType !== "USER" && value.senderType !== "AI" && value.senderType !== "SYSTEM") {
    return null;
  }
  if (value.messageType !== "TEXT" && value.messageType !== "IMAGE") return null;
  if (value.content !== undefined && value.content !== null && typeof value.content !== "string") {
    return null;
  }

  return {
    reportId,
    messageId,
    senderType: value.senderType,
    messageType: value.messageType,
    status: typeof value.status === "string" ? value.status : undefined,
    content: (value.content as string | null | undefined) ?? undefined,
  };
}

function toReportMessageCreatedPayload(candidate: unknown): ReportMessageCreatedPayload | null {
  if (!candidate || typeof candidate !== "object") return null;
  const value = candidate as {
    eventId?: unknown;
    reportId?: unknown;
    messageId?: unknown;
    senderType?: unknown;
    messageType?: unknown;
    content?: unknown;
    sentAt?: unknown;
  };

  const reportId = toNumber(value.reportId);
  const messageId = toNumber(value.messageId);
  if (reportId === null || messageId === null) return null;
  if (value.senderType !== "USER" && value.senderType !== "AI" && value.senderType !== "SYSTEM") {
    return null;
  }
  if (value.messageType !== "TEXT" && value.messageType !== "IMAGE") return null;
  if (typeof value.sentAt !== "string") return null;
  if (value.content !== null && typeof value.content !== "string") return null;

  return {
    eventId:
      typeof value.eventId === "string" ? value.eventId : `report-message-${reportId}-${messageId}`,
    reportId,
    messageId,
    senderType: value.senderType,
    messageType: value.messageType,
    content: (value.content as string | null) ?? null,
    sentAt: value.sentAt,
  };
}

function toUnreadChangedPayload(candidate: unknown): UnreadChangedUserEventPayload | null {
  if (!candidate || typeof candidate !== "object") return null;
  const value = candidate as Partial<UnreadChangedUserEventPayload> & {
    userId?: number | string;
    roomId?: number | string;
    unreadCount?: number | string;
    participantsCount?: number | string;
    lastUserMessagePreview?: string | null;
    lastUserMessageSentAt?: string | null;
  };
  const userId = toNumber(value.userId);
  const roomId = toNumber(value.roomId);
  if (userId !== null && roomId !== null) {
    const unreadCount = toNumber(value.unreadCount);
    const participantsCount = toNumber(value.participantsCount);
    const lastUserMessagePreview =
      typeof value.lastUserMessagePreview === "string"
        ? value.lastUserMessagePreview
        : value.lastUserMessagePreview === null
          ? null
          : undefined;
    const lastUserMessageSentAt =
      typeof value.lastUserMessageSentAt === "string"
        ? value.lastUserMessageSentAt
        : value.lastUserMessageSentAt === null
          ? null
          : undefined;

    return {
      eventId: typeof value.eventId === "string" ? value.eventId : `unread-${roomId}-${Date.now()}`,
      userId,
      roomId,
      unreadCount: unreadCount ?? undefined,
      participantsCount: participantsCount ?? undefined,
      lastUserMessagePreview,
      lastUserMessageSentAt,
    };
  }
  return null;
}

// ─── ChatStompSession ──────────────────────────────────────────────────────────

class ChatStompSession {
  private client: Client | null = null;
  private config: ChatSocketStartConfig | null = null;
  private isRefreshing = false;
  private connectedUserId: number | null = null;

  // Active STOMP subscriptions (cleared on each reconnect)
  private handshakeSubscription: StompSubscription | null = null;
  private userQueueSubscription: StompSubscription | null = null;
  private userQueueRoomSubscription: StompSubscription | null = null;
  private userQueueReportSubscription: StompSubscription | null = null;

  // Active room subscriptions (preserved across auto-reconnects)
  private activeRooms = new Map<number, ActiveRoomEntry>();

  // Event listeners
  private unreadChangedListeners = new Set<UnreadChangedListener>();
  private messageSendAcceptedListeners = new Set<MessageSendAcceptedListener>();
  private messageSendRejectedListeners = new Set<MessageSendRejectedListener>();
  private messageSendFailedListeners = new Set<MessageSendFailedListener>();
  private reportMessageSendAcceptedListeners = new Set<ReportMessageSendAcceptedListener>();
  private reportMessageCreatedListeners = new Set<ReportMessageCreatedListener>();
  private reportMessageSendRejectedListeners = new Set<ReportMessageSendRejectedListener>();
  private reportMessageSendFailedListeners = new Set<ReportMessageSendFailedListener>();
  private reportStreamStartListeners = new Set<ReportStreamStartListener>();
  private reportStreamChunkListeners = new Set<ReportStreamChunkListener>();
  private reportStreamEndListeners = new Set<ReportStreamEndListener>();
  private socketResyncRequiredListeners = new Set<SocketResyncRequiredListener>();
  private videoSessionSyncedListeners = new Set<VideoSessionSyncedListener>();
  private videoCameraToggleAcceptedListeners = new Set<VideoCameraToggleAcceptedListener>();
  private videoTokenIssuedListeners = new Set<VideoTokenIssuedListener>();
  private pendingMessagePayloads = new Map<string, MessageSendPayload>();
  private fallbackTriggeredMessageIds = new Set<string>();
  private scheduledRefreshReconnectTimer: number | null = null;
  private duplicateReconnectTimer: number | null = null;
  private duplicateReconnectRetryCount = 0;
  private isDuplicateReconnectPending = false;
  private lastSeenProgressByParticipant = new Map<number, LastSeenProgress>();
  private pendingReportSendRequest: PendingReportSendRequest | null = null;

  // ─── Public getters ──────────────────────────────────────────────────────────

  get userId(): number | null {
    return this.connectedUserId;
  }

  // ─── Public listener registration ────────────────────────────────────────────

  onUnreadChanged(listener: UnreadChangedListener) {
    this.unreadChangedListeners.add(listener);
    return () => {
      this.unreadChangedListeners.delete(listener);
    };
  }

  onMessageSendAccepted(listener: MessageSendAcceptedListener) {
    this.messageSendAcceptedListeners.add(listener);
    return () => {
      this.messageSendAcceptedListeners.delete(listener);
    };
  }

  onMessageSendRejected(listener: MessageSendRejectedListener) {
    this.messageSendRejectedListeners.add(listener);
    return () => {
      this.messageSendRejectedListeners.delete(listener);
    };
  }

  onMessageSendFailed(listener: MessageSendFailedListener) {
    this.messageSendFailedListeners.add(listener);
    return () => {
      this.messageSendFailedListeners.delete(listener);
    };
  }

  onVideoSessionSynced(listener: VideoSessionSyncedListener) {
    this.videoSessionSyncedListeners.add(listener);
    return () => {
      this.videoSessionSyncedListeners.delete(listener);
    };
  }

  onVideoCameraToggleAccepted(listener: VideoCameraToggleAcceptedListener) {
    this.videoCameraToggleAcceptedListeners.add(listener);
    return () => {
      this.videoCameraToggleAcceptedListeners.delete(listener);
    };
  }

  onVideoTokenIssued(listener: VideoTokenIssuedListener) {
    this.videoTokenIssuedListeners.add(listener);
    return () => {
      this.videoTokenIssuedListeners.delete(listener);
    };
  }

  onReportMessageSendAccepted(listener: ReportMessageSendAcceptedListener) {
    this.reportMessageSendAcceptedListeners.add(listener);
    return () => {
      this.reportMessageSendAcceptedListeners.delete(listener);
    };
  }

  onReportMessageCreated(listener: ReportMessageCreatedListener) {
    this.reportMessageCreatedListeners.add(listener);
    return () => {
      this.reportMessageCreatedListeners.delete(listener);
    };
  }

  onReportMessageSendRejected(listener: ReportMessageSendRejectedListener) {
    this.reportMessageSendRejectedListeners.add(listener);
    return () => {
      this.reportMessageSendRejectedListeners.delete(listener);
    };
  }

  onReportMessageSendFailed(listener: ReportMessageSendFailedListener) {
    this.reportMessageSendFailedListeners.add(listener);
    return () => {
      this.reportMessageSendFailedListeners.delete(listener);
    };
  }

  onReportStreamChunk(listener: ReportStreamChunkListener) {
    this.reportStreamChunkListeners.add(listener);
    return () => {
      this.reportStreamChunkListeners.delete(listener);
    };
  }

  onReportStreamStart(listener: ReportStreamStartListener) {
    this.reportStreamStartListeners.add(listener);
    return () => {
      this.reportStreamStartListeners.delete(listener);
    };
  }

  onReportStreamEnd(listener: ReportStreamEndListener) {
    this.reportStreamEndListeners.add(listener);
    return () => {
      this.reportStreamEndListeners.delete(listener);
    };
  }

  onSocketResyncRequired(listener: SocketResyncRequiredListener) {
    this.socketResyncRequiredListeners.add(listener);
    return () => {
      this.socketResyncRequiredListeners.delete(listener);
    };
  }

  // ─── Room subscription ────────────────────────────────────────────────────────

  /*
   * 채팅방을 구독한다. 이미 구독 중인 방은 중복 등록하지 않는다.
   * 반환된 함수를 호출하면 구독이 해제된다 (컴포넌트 unmount 시 사용).
   */
  subscribeToRoom({ roomId, participantId, ...callbacks }: SubscribeToRoomParams): () => void {
    if (typeof participantId !== "number" || participantId <= 0) {
      chatSocketWarn("[chat-socket] subscribeToRoom: participantId 미확인으로 구독을 중단합니다.", {
        roomId,
        participantId,
      });
      return () => undefined;
    }

    if (this.activeRooms.has(roomId)) {
      chatSocketLog("[chat-socket] subscribeToRoom: 이미 구독 중", { roomId });
      return () => this.teardownRoomSubscription(roomId);
    }

    const entry: ActiveRoomEntry = {
      participantId,
      stompSubscription: null,
      ...callbacks,
    };
    this.activeRooms.set(roomId, entry);

    if (this.client?.connected && this.config) {
      this.doSubscribeRoom(this.client, this.config, roomId, entry);
    }

    return () => this.teardownRoomSubscription(roomId);
  }

  // ─── Video participant online ──────────────────────────────────────────────────

  sendVideoParticipantOnline(payload: VideoParticipantOnlinePayload) {
    if (!this.client?.connected || !this.config) {
      chatSocketWarn("[chat-socket] sendVideoParticipantOnline: 소켓 미연결 상태");
      return;
    }
    this.publishWithReceipt({
      client: this.client,
      destination: this.config.videoParticipantOnlineDestination,
      body: JSON.stringify(payload),
      eventName: "video.participant.online",
      payloadForLog: { roomId: payload.roomId, participantId: payload.participantId },
    });
  }

  sendVideoParticipantHeartbeat(payload: VideoParticipantHeartbeatPayload) {
    if (!this.client?.connected || !this.config) return;
    this.publishWithReceipt({
      client: this.client,
      destination: this.config.videoParticipantHeartbeatDestination,
      body: JSON.stringify(payload),
      eventName: "video.participant.heartbeat",
      payloadForLog: { roomId: payload.roomId, participantId: payload.participantId },
    });
  }

  sendVideoParticipantOffline(payload: VideoParticipantOfflinePayload) {
    if (!this.client?.connected || !this.config) {
      chatSocketWarn("[chat-socket] sendVideoParticipantOffline: 소켓 미연결 상태");
      return;
    }
    this.publishWithReceipt({
      client: this.client,
      destination: this.config.videoParticipantOfflineDestination,
      body: JSON.stringify(payload),
      eventName: "video.participant.offline",
      payloadForLog: { roomId: payload.roomId, participantId: payload.participantId },
    });
  }

  // ─── Message send ─────────────────────────────────────────────────────────────

  sendMessage(payload: MessageSendPayload) {
    this.pendingMessagePayloads.set(payload.idempotencyKey, payload);

    if (!this.client?.connected || !this.config) {
      chatSocketWarn("[chat-socket] sendMessage: 소켓 미연결 상태");
      this.triggerSendMessageHttpFallback(payload.idempotencyKey, "socket_not_connected");
      return;
    }

    this.publishWithReceipt({
      client: this.client,
      destination: this.config.messageSendDestination,
      body: JSON.stringify(payload),
      eventName: "message.send",
      payloadForLog: { roomId: payload.roomId, idempotencyKey: payload.idempotencyKey },
      onReceiptTimeout: () => {
        this.triggerSendMessageHttpFallback(payload.idempotencyKey, "receipt_timeout");
      },
      onPublishError: () => {
        this.triggerSendMessageHttpFallback(payload.idempotencyKey, "publish_error");
      },
    });
  }

  sendReportMessage(payload: ReportMessageSendPayload): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.pendingReportSendRequest && !this.pendingReportSendRequest.settled) {
        reject(new Error("이미 리포트 메시지를 전송 중입니다."));
        return;
      }

      this.pendingReportSendRequest = {
        payload,
        resolve,
        reject,
        ackTimeoutId: null,
        fallbackTriggered: false,
        settled: false,
      };

      const ackTimeoutId = window.setTimeout(() => {
        this.triggerReportMessageHttpFallback("ack_timeout");
      }, REPORT_MESSAGE_ACK_TIMEOUT_MS);
      this.pendingReportSendRequest.ackTimeoutId = ackTimeoutId;

      if (!this.client?.connected || !this.config) {
        this.triggerReportMessageHttpFallback("socket_not_connected");
        return;
      }

      this.publishWithReceipt({
        client: this.client,
        destination: this.config.reportMessageSendDestination,
        body: JSON.stringify(payload),
        eventName: "report.message.send",
        payloadForLog: { reportId: payload.reportId },
        onReceiptTimeout: () => {
          this.triggerReportMessageHttpFallback("receipt_timeout");
        },
        onPublishError: () => {
          this.triggerReportMessageHttpFallback("publish_error");
        },
      });
    });
  }

  sendLastSeenUpdate(payload: LastSeenUpdatePayload) {
    if (payload.lastSeenMessageId <= 0) return;
    const progress = this.lastSeenProgressByParticipant.get(payload.participantId);
    const latestRequestedMessageId = progress?.latestRequestedMessageId ?? 0;
    if (payload.lastSeenMessageId <= latestRequestedMessageId) return;

    this.lastSeenProgressByParticipant.set(payload.participantId, {
      latestRequestedMessageId: payload.lastSeenMessageId,
      latestConfirmedMessageId: progress?.latestConfirmedMessageId ?? 0,
    });

    if (!this.client?.connected || !this.config) {
      void this.sendLastSeenUpdateWithHttpFallback(payload, "socket_not_connected");
      return;
    }

    this.publishWithReceipt({
      client: this.client,
      destination: this.config.lastSeenUpdateDestination,
      body: JSON.stringify(payload),
      eventName: "lastSeen.update",
      payloadForLog: payload,
      onReceiptTimeout: () => {
        const latestRequested =
          this.lastSeenProgressByParticipant.get(payload.participantId)?.latestRequestedMessageId ??
          0;
        if (payload.lastSeenMessageId < latestRequested) {
          chatSocketLog("[chat-socket] skip stale lastSeen fallback on receipt timeout", {
            participantId: payload.participantId,
            lastSeenMessageId: payload.lastSeenMessageId,
            latestRequested,
          });
          return;
        }
        void this.sendLastSeenUpdateWithHttpFallback(payload, "receipt_timeout");
      },
      onPublishError: () => {
        const latestRequested =
          this.lastSeenProgressByParticipant.get(payload.participantId)?.latestRequestedMessageId ??
          0;
        if (payload.lastSeenMessageId < latestRequested) {
          chatSocketLog("[chat-socket] skip stale lastSeen fallback on publish error", {
            participantId: payload.participantId,
            lastSeenMessageId: payload.lastSeenMessageId,
            latestRequested,
          });
          return;
        }
        void this.sendLastSeenUpdateWithHttpFallback(payload, "publish_error");
      },
    });
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────────

  /*
   * 소켓 연결 시작 엔트리 포인트.
   * - 환경값/URL/토큰 유효성 점검
   * - 동일 토큰 중복 start 방지
   * - CONNECT → CONNECTED → SUBSCRIBE_USER 핸드셰이크 수행
   */
  start() {
    if (typeof window === "undefined") return;

    const startConfig = resolveChatSocketStartConfig();
    if (!startConfig) return;

    const deviceId = getDeviceId();
    if (!deviceId) {
      chatSocketWarn("[chat-socket] skip connect: deviceId가 없습니다.");
      return;
    }

    chatSocketLog("[chat-socket] start requested", {
      brokerURL: startConfig.brokerURL,
      isActive: this.client?.active ?? false,
    });

    if (this.client?.active) {
      chatSocketLog("[chat-socket] start skipped: existing active client", {
        isActive: this.client.active,
        isConnected: this.client.connected,
      });
      return;
    }

    if (this.client) {
      chatSocketLog("[chat-socket] start requested with changed token: reconnecting");
      // token refresh scenario: preserve activeRooms for re-subscribe after reconnect
      this.stopClient(
        { code: "RECONNECT", message: "재연결을 위해 기존 소켓 연결을 종료합니다." },
        true,
      );
    }

    this.config = startConfig;

    const client = new Client({
      brokerURL: startConfig.brokerURL,
      reconnectDelay: startConfig.reconnectDelayMs,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectHeaders: { deviceId: deviceId ?? "", "X-XSRF-TOKEN": getXsrfToken() ?? "" },
      debug: resolveStompDebugLogger(),
    });

    client.onConnect = () => {
      this.setupSubscriptions(client, startConfig, deviceId);
    };

    client.onStompError = (frame: IFrame) => {
      const headerCode = toStompHeaderErrorCode(frame.headers["message"], frame.headers["code"]);
      chatSocketWarn("[chat-socket] STOMP error", {
        command: frame.command,
        headers: frame.headers,
        body: frame.body,
      });
      if (headerCode === "CONNECT_TOKEN_EXPIRED") {
        void this.refreshAndReconnect();
      }
    };

    client.onWebSocketError = (error) => {
      chatSocketError("[chat-socket] WebSocket error", error);
    };

    client.onWebSocketClose = (event) => {
      chatSocketLog("[chat-socket] WebSocket closed", {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
    };

    client.activate();
    chatSocketLog("[chat-socket] client.activate called");
    this.client = client;
  }

  /*
   * 소켓 연결 종료 엔트리 포인트.
   * activeRooms를 포함한 세션 전체를 초기화한다 (로그아웃/앱 언마운트용).
   */
  stop(payload: DisconnectHandshakePayload = DEFAULT_LOGOUT_DISCONNECT_PAYLOAD) {
    this.isRefreshing = false;
    this.resetReconnectState();
    this.stopClient(payload, false);
  }

  // ─── Private: session teardown ───────────────────────────────────────────────

  /*
   * 실제 소켓 종료 처리.
   * preserveRooms=true: 토큰 갱신/재연결 시 room 목록 보존 (stompSubscription만 null 처리).
   * preserveRooms=false: 로그아웃 시 room 목록까지 초기화.
   */
  private stopClient(payload: DisconnectHandshakePayload, preserveRooms: boolean) {
    const client = this.client;
    const disconnectDestination = resolveChatSocketDisconnectDestination();

    chatSocketLog("[chat-socket] stop requested", {
      payload,
      preserveRooms,
      hasClient: Boolean(client),
      isActive: client?.active ?? false,
      isConnected: client?.connected ?? false,
    });

    if (client?.connected && disconnectDestination) {
      const receiptId = `disconnect-${Date.now()}`;
      try {
        client.watchForReceipt(receiptId, () => {
          chatSocketLog("[chat-socket] socket.disconnect receipt received", {
            receiptId,
            destination: disconnectDestination,
          });
        });
        client.publish({
          destination: disconnectDestination,
          headers: { receipt: receiptId },
          body: JSON.stringify(payload),
        });
        chatSocketLog("[chat-socket] socket.disconnect published", {
          destination: disconnectDestination,
          payload,
          receiptId,
        });
      } catch (error) {
        chatSocketError("[chat-socket] socket.disconnect publish failed", error);
      }
    }

    // STOMP 자동 재연결 시 이전 구독 객체는 이미 닫힌 WebSocket에 묶여 있으므로
    // unsubscribe() 호출 없이 참조만 초기화한다.
    this.handshakeSubscription = null;
    this.userQueueSubscription = null;
    this.userQueueRoomSubscription = null;
    this.userQueueReportSubscription = null;

    if (preserveRooms) {
      // stompSubscription refs are on the old socket; null them but keep room metadata
      for (const entry of this.activeRooms.values()) {
        entry.stompSubscription = null;
      }
    } else {
      this.resetReconnectState();
      this.activeRooms.clear();
      this.lastSeenProgressByParticipant.clear();
      this.pendingMessagePayloads.clear();
      this.fallbackTriggeredMessageIds.clear();
      if (this.pendingReportSendRequest && !this.pendingReportSendRequest.settled) {
        this.settlePendingReportSendAsFailure({
          code: "SOCKET_STOPPED",
          message: "소켓 연결이 종료되어 전송이 취소되었습니다.",
          retryable: true,
        });
      }
    }

    if (client) {
      client.deactivate();
    }

    this.client = null;
    this.config = null;
    this.connectedUserId = null;
  }

  private clearScheduledRefreshReconnectTimer() {
    if (this.scheduledRefreshReconnectTimer === null) return;
    window.clearTimeout(this.scheduledRefreshReconnectTimer);
    this.scheduledRefreshReconnectTimer = null;
  }

  private clearDuplicateReconnectTimer() {
    if (this.duplicateReconnectTimer === null) return;
    window.clearTimeout(this.duplicateReconnectTimer);
    this.duplicateReconnectTimer = null;
  }

  private resetReconnectState() {
    this.clearScheduledRefreshReconnectTimer();
    this.clearDuplicateReconnectTimer();
    this.duplicateReconnectRetryCount = 0;
    this.isDuplicateReconnectPending = false;
  }

  private scheduleRefreshReconnect(delayMs: number) {
    if (this.isDuplicateReconnectPending) return;
    this.clearScheduledRefreshReconnectTimer();

    this.scheduledRefreshReconnectTimer = window.setTimeout(() => {
      this.scheduledRefreshReconnectTimer = null;
      if (this.isDuplicateReconnectPending) return;
      if (!this.client) return;
      void this.refreshAndReconnect();
    }, delayMs);
  }

  private resolveDuplicateReconnectDelay(nextAttempt: number, retryAfterMs?: number) {
    if (typeof retryAfterMs === "number" && retryAfterMs > 0) return retryAfterMs;
    return Math.min(
      DUPLICATE_RECONNECT_BASE_DELAY_MS * 2 ** (nextAttempt - 1),
      DUPLICATE_RECONNECT_MAX_DELAY_MS,
    );
  }

  private handleDuplicateSessionConflict(message: string, retryAfterMs?: number) {
    if (this.isDuplicateReconnectPending) return;

    if (!this.client) {
      this.stop({
        code: "CONNECT_DUPLICATE_SESSION",
        message: "중복 세션 재연결에 필요한 토큰이 없어 연결을 종료합니다.",
      });
      return;
    }

    const nextAttempt = this.duplicateReconnectRetryCount + 1;
    const effectiveAttempt = Math.min(nextAttempt, DUPLICATE_RECONNECT_MAX_RETRIES);
    const isOverLimit = nextAttempt > DUPLICATE_RECONNECT_MAX_RETRIES;

    this.clearScheduledRefreshReconnectTimer();
    this.duplicateReconnectRetryCount = nextAttempt;
    this.isDuplicateReconnectPending = true;
    const retryDelayMs = this.resolveDuplicateReconnectDelay(effectiveAttempt, retryAfterMs);

    chatSocketLog("[chat-socket] duplicate session reconnect scheduled", {
      nextAttempt,
      effectiveAttempt,
      isOverLimit,
      retryDelayMs,
    });

    this.stopClient(
      {
        code: "RECONNECT",
        message: `중복 세션 충돌 정리 후 재연결합니다. (${effectiveAttempt}/${DUPLICATE_RECONNECT_MAX_RETRIES}${isOverLimit ? "+" : ""})`,
      },
      true,
    );

    this.duplicateReconnectTimer = window.setTimeout(() => {
      this.duplicateReconnectTimer = null;
      this.isDuplicateReconnectPending = false;
      this.start();
    }, retryDelayMs);
  }

  private emitListeners<T>(listeners: Set<(payload: T) => void>, payload: T, label: string) {
    listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (error) {
        chatSocketError(`[chat-socket] ${label} listener error`, error);
      }
    });
  }

  private publishWithReceipt(params: {
    client: Client;
    destination: string;
    body: string;
    eventName: string;
    payloadForLog?: unknown;
    onReceiptTimeout?: () => void;
    onPublishError?: (error: unknown) => void;
  }) {
    const {
      client,
      destination,
      body,
      eventName,
      payloadForLog,
      onReceiptTimeout,
      onPublishError,
    } = params;
    const receiptId = `${eventName}-${Date.now()}`;
    let isReceiptReceived = false;

    const timeoutId = window.setTimeout(() => {
      if (isReceiptReceived) return;
      chatSocketWarn(`[chat-socket] ${eventName} receipt timeout`, {
        destination,
        receiptId,
        timeoutMs: PUBLISH_RECEIPT_TIMEOUT_MS,
      });
      onReceiptTimeout?.();
    }, PUBLISH_RECEIPT_TIMEOUT_MS);

    try {
      client.watchForReceipt(receiptId, () => {
        isReceiptReceived = true;
        window.clearTimeout(timeoutId);
        chatSocketLog(`[chat-socket] ${eventName} receipt received`, { destination, receiptId });
      });
      client.publish({
        destination,
        headers: { receipt: receiptId },
        body,
      });
      chatSocketLog(`[chat-socket] ${eventName} published`, {
        destination,
        receiptId,
        payload: payloadForLog,
      });
    } catch (error) {
      window.clearTimeout(timeoutId);
      chatSocketError(`[chat-socket] ${eventName} publish failed`, {
        destination,
        receiptId,
        error,
      });
      onPublishError?.(error);
    }
  }

  private triggerSendMessageHttpFallback(idempotencyKey: string, reason: string) {
    const payload = this.pendingMessagePayloads.get(idempotencyKey);
    if (!payload) return;
    if (this.fallbackTriggeredMessageIds.has(idempotencyKey)) return;

    this.fallbackTriggeredMessageIds.add(idempotencyKey);
    void this.sendMessageWithHttpFallback(payload, reason);
  }

  private clearPendingReportAckTimeout() {
    const timeoutId = this.pendingReportSendRequest?.ackTimeoutId ?? null;
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
  }

  private settlePendingReportSendAsSuccess(payload?: ReportMessageSendAcceptedPayload) {
    const pending = this.pendingReportSendRequest;
    if (!pending || pending.settled) return;

    pending.settled = true;
    this.clearPendingReportAckTimeout();
    this.pendingReportSendRequest = null;
    this.emitListeners(
      this.reportMessageSendAcceptedListeners,
      payload ?? { reportId: pending.payload.reportId },
      "reportMessageSendAccepted",
    );
    pending.resolve();
  }

  private settlePendingReportSendAsFailure(payload: ReportMessageSendRejectedPayload) {
    const pending = this.pendingReportSendRequest;
    if (!pending || pending.settled) return;

    pending.settled = true;
    this.clearPendingReportAckTimeout();
    this.pendingReportSendRequest = null;
    this.emitListeners(
      this.reportMessageSendRejectedListeners,
      payload,
      "reportMessageSendRejected",
    );
    pending.reject(new Error(payload.message || "리포트 메시지 전송에 실패했습니다."));
  }

  private triggerReportMessageHttpFallback(reason: string) {
    const pending = this.pendingReportSendRequest;
    if (!pending || pending.settled) return;
    if (pending.fallbackTriggered) return;
    pending.fallbackTriggered = true;

    void this.sendReportMessageWithHttpFallback(pending.payload, reason);
  }

  private async sendReportMessageWithHttpFallback(
    payload: ReportMessageSendPayload,
    reason: string,
  ) {
    const requestDto: ReportMessageFallbackRequestDto = {
      inputMessage: payload.inputMessage,
    };

    try {
      await AuthService.refreshAndRetry(() =>
        apiFetch<void, ReportMessageFallbackRequestDto>(
          Endpoint.REPORTS.MESSAGE(payload.reportId),
          {
            method: "POST",
            body: requestDto,
            authRequired: true,
          },
        ),
      );

      chatSocketLog("[chat-socket] report.message.send HTTP fallback success", {
        reportId: payload.reportId,
        reason,
      });
      this.settlePendingReportSendAsSuccess({ reportId: payload.reportId });
    } catch (error) {
      chatSocketError("[chat-socket] report.message.send HTTP fallback failed", {
        reportId: payload.reportId,
        reason,
        error,
      });
      this.settlePendingReportSendAsFailure({
        code: "REPORT_MESSAGE_FALLBACK_FAILED",
        message: "리포트 메시지 전송에 실패했습니다.",
        retryable: false,
      });
    }
  }

  private async sendMessageWithHttpFallback(payload: MessageSendPayload, reason: string) {
    const requestDto: SendMessageFallbackRequestDto = {
      idempotencyKey: payload.idempotencyKey,
      messageType: payload.messageType,
      content: payload.content,
      imageKeys: payload.imageKeys,
    };

    try {
      const response = await AuthService.refreshAndRetry(() =>
        apiFetch<SendMessageFallbackResponseDto | void, SendMessageFallbackRequestDto>(
          Endpoint.CHAT_ROOMS.SEND_MESSAGE(payload.roomId),
          {
            method: "POST",
            body: requestDto,
            authRequired: true,
          },
        ),
      );

      chatSocketLog("[chat-socket] message.send HTTP fallback success", {
        roomId: payload.roomId,
        idempotencyKey: payload.idempotencyKey,
        reason,
        messageId: response && typeof response === "object" ? response.messageId : undefined,
      });
      this.pendingMessagePayloads.delete(payload.idempotencyKey);
      this.fallbackTriggeredMessageIds.delete(payload.idempotencyKey);

      const messageId =
        response && typeof response === "object" && typeof response.messageId === "number"
          ? response.messageId
          : undefined;

      if (messageId !== undefined) {
        const acceptedPayload: MessageSendAcceptedPayload = {
          idempotencyKey: payload.idempotencyKey,
          messageId,
          status:
            response && typeof response === "object" && typeof response.status === "string"
              ? response.status
              : "SENT",
          sentAt:
            response && typeof response === "object" && typeof response.sentAt === "string"
              ? response.sentAt
              : new Date().toISOString(),
        };
        this.emitListeners(
          this.messageSendAcceptedListeners,
          acceptedPayload,
          "messageSendAccepted",
        );
      }
    } catch (error) {
      chatSocketError("[chat-socket] message.send HTTP fallback failed", {
        roomId: payload.roomId,
        idempotencyKey: payload.idempotencyKey,
        reason,
        error,
      });
    }
  }

  private async sendLastSeenUpdateWithHttpFallback(payload: LastSeenUpdatePayload, reason: string) {
    const latestRequested =
      this.lastSeenProgressByParticipant.get(payload.participantId)?.latestRequestedMessageId ?? 0;
    if (payload.lastSeenMessageId < latestRequested) {
      chatSocketLog("[chat-socket] skip stale lastSeen fallback request", {
        participantId: payload.participantId,
        lastSeenMessageId: payload.lastSeenMessageId,
        latestRequested,
        reason,
      });
      return;
    }

    const requestDto: LastSeenUpdateFallbackRequestDto = {
      lastSeenMessageId: payload.lastSeenMessageId,
    };

    try {
      await AuthService.refreshAndRetry(() =>
        apiFetch<void, LastSeenUpdateFallbackRequestDto>(
          Endpoint.CHAT_ROOMS.PARTICIPANT_MESSAGE(payload.participantId),
          {
            method: "PATCH",
            body: requestDto,
            authRequired: true,
          },
        ),
      );

      chatSocketLog("[chat-socket] lastSeen.update HTTP fallback success", {
        participantId: payload.participantId,
        lastSeenMessageId: payload.lastSeenMessageId,
        reason,
      });
      const progress = this.lastSeenProgressByParticipant.get(payload.participantId);
      this.lastSeenProgressByParticipant.set(payload.participantId, {
        latestRequestedMessageId: Math.max(
          payload.lastSeenMessageId,
          progress?.latestRequestedMessageId ?? 0,
        ),
        latestConfirmedMessageId: Math.max(
          payload.lastSeenMessageId,
          progress?.latestConfirmedMessageId ?? 0,
        ),
      });
    } catch (error) {
      if (error instanceof ApiError && error.httpStatus === 409) {
        chatSocketLog("[chat-socket] lastSeen.update fallback conflict ignored", {
          participantId: payload.participantId,
          lastSeenMessageId: payload.lastSeenMessageId,
          reason,
          code: error.code,
          message: error.message,
        });
        return;
      }
      chatSocketError("[chat-socket] lastSeen.update HTTP fallback failed", {
        participantId: payload.participantId,
        lastSeenMessageId: payload.lastSeenMessageId,
        reason,
        error,
      });
    }
  }

  // ─── Subscription setup (called on every onConnect) ──────────────────────────

  private setupSubscriptions(client: Client, config: ChatSocketStartConfig, deviceId: string) {
    // Clear refs from previous connection (already closed socket)
    this.handshakeSubscription = null;
    this.userQueueSubscription = null;
    this.userQueueRoomSubscription = null;
    this.userQueueReportSubscription = null;

    this.handshakeSubscription = this.subscribeHandshakeChannel(client, config);
    this.userQueueSubscription = this.subscribeUserQueue(client, config);
    this.userQueueRoomSubscription = this.subscribeUserRoomQueue(client, config);
    this.userQueueReportSubscription = this.subscribeUserReportQueue(client, config);

    // Publish socket.connect handshake
    client.publish({
      destination: config.connectDestination,
      body: JSON.stringify({ deviceId }),
    });
    chatSocketLog("[chat-socket] socket.connect published", {
      destination: config.connectDestination,
      connectedDestination: config.connectedDestination,
    });
  }

  private resubscribeActiveRooms(client: Client, config: ChatSocketStartConfig) {
    // Re-subscribe active rooms only after socket.connected success.
    for (const [roomId, entry] of this.activeRooms) {
      entry.stompSubscription = null;
      this.doSubscribeRoom(client, config, roomId, entry);
    }
  }

  // ─── Handshake channel (/user/queue/handshake) ────────────────────────────────

  private subscribeHandshakeChannel(client: Client, config: ChatSocketStartConfig) {
    return client.subscribe(config.connectedDestination, (message) => {
      // 1. socket.connected error
      const errorCode = parseConnectedErrorCode(message);
      if (errorCode) {
        chatSocketWarn("[chat-socket] socket.connected error", {
          code: errorCode,
          body: message.body,
        });
        if (errorCode === "CONNECT_TOKEN_EXPIRED") {
          this.scheduleRefreshReconnect(0);
        } else if (errorCode === "CONNECT_DUPLICATE_SESSION") {
          this.handleDuplicateSessionConflict("이미 연결된 세션이 존재합니다.");
        } else {
          this.stop({
            code: errorCode,
            message: `서버 응답 코드(${errorCode})로 연결을 종료합니다.`,
          });
        }
        return;
      }

      // 2. socket.connected success
      const connectedPayload = parseConnectedSuccessPayload(message);
      if (connectedPayload) {
        chatSocketLog("[chat-socket] socket.connected", connectedPayload);
        this.connectedUserId = connectedPayload.userId;
        setAuthUserId(connectedPayload.userId);
        this.resetReconnectState();

        const subscribeUserPayload: SubscribeUserRequestPayload = {
          requestedAt: new Date().toISOString(),
        };
        this.publishWithReceipt({
          client,
          destination: config.subscribeUserDestination,
          body: JSON.stringify(subscribeUserPayload),
          eventName: "subscribe.user",
          payloadForLog: subscribeUserPayload,
        });
        this.resubscribeActiveRooms(client, config);
        return;
      }

      // 3. Other handshake events (ping, reconnectRequired, resyncRequired, disconnect)
      const envelope = parseEventEnvelope(message.body);
      if (!envelope) return;
      const { event, payload } = envelope;

      if (event === "socket.ping") {
        chatSocketLog("[chat-socket] socket.ping → pong");
        this.publishWithReceipt({
          client,
          destination: config.pongDestination,
          body: JSON.stringify({ timestamp: new Date().toISOString() }),
          eventName: "socket.pong",
        });
        return;
      }

      if (event === "socket.reconnectRequired") {
        const reconnectPayload = payload as SocketReconnectRequiredPayload;
        chatSocketLog("[chat-socket] socket.reconnectRequired", reconnectPayload);
        const delay = reconnectPayload?.retryAfterMs ?? config.reconnectDelayMs;
        if (reconnectPayload?.code === "TOKEN_EXPIRED") {
          this.scheduleRefreshReconnect(delay);
        } else {
          this.clearScheduledRefreshReconnectTimer();
          this.scheduledRefreshReconnectTimer = window.setTimeout(() => {
            this.scheduledRefreshReconnectTimer = null;
            this.start();
          }, delay);
        }
        return;
      }

      if (event === "socket.resyncRequired") {
        const resyncPayload = payload as SocketResyncRequiredPayload;
        chatSocketLog("[chat-socket] socket.resyncRequired", resyncPayload);
        this.emitListeners(
          this.socketResyncRequiredListeners,
          resyncPayload,
          "socketResyncRequired",
        );
        return;
      }

      if (event === "socket.disconnect") {
        const disconnectPayload = payload as SocketServerDisconnectPayload;
        chatSocketLog("[chat-socket] socket.disconnect from server", disconnectPayload);
        this.stop({
          code: disconnectPayload?.code ?? "SERVER_DISCONNECT",
          message: disconnectPayload?.message ?? "서버에 의해 연결이 종료되었습니다.",
        });
        return;
      }

      if (event === "socket.error") {
        const errorPayload =
          payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
        const code = typeof errorPayload?.code === "string" ? errorPayload.code : "SOCKET_ERROR";
        const message =
          typeof errorPayload?.message === "string"
            ? errorPayload.message
            : "소켓 연결 중 오류가 발생했습니다.";
        const retryAfterMs =
          typeof errorPayload?.retryAfterMs === "number" ? errorPayload.retryAfterMs : undefined;

        if (code === "CONNECT_TOKEN_EXPIRED" || code === "CONNECT_UNAUTHORIZED") {
          this.scheduleRefreshReconnect(retryAfterMs ?? 0);
          return;
        }

        if (code === "CONNECT_DUPLICATE_SESSION") {
          this.handleDuplicateSessionConflict(message, retryAfterMs);
          return;
        }

        this.stop({ code, message });
        return;
      }

      chatSocketLog("[chat-socket] unknown handshake event", { event, body: message.body });
    });
  }

  // ─── User queue (/user/queue/user) ───────────────────────────────────────────

  private subscribeUserQueue(client: Client, config: ChatSocketStartConfig) {
    return client.subscribe(config.subscribedUserDestination, (message) => {
      const envelope = parseEventEnvelope(message.body);
      if (!envelope) return;
      const { event, payload } = envelope;

      if (isUserQueueEvent(event, "unreadChanged")) {
        const unreadPayload = toUnreadChangedPayload(payload);
        if (unreadPayload) {
          chatSocketLog("[chat-socket] unreadChanged", unreadPayload);
          this.emitListeners(this.unreadChangedListeners, unreadPayload, "unreadChanged");
          return;
        }
      }

      if (isUserQueueEvent(event, "subscribed.user")) {
        const subscribedPayload = parseSubscribedUserPayload(message.body);
        if (subscribedPayload) {
          chatSocketLog("[chat-socket] subscribed.user", subscribedPayload);
          return;
        }
      }

      if (this.handleReportQueueEvent(event, payload)) {
        return;
      }

      chatSocketWarn("[chat-socket] user queue payload 파싱 실패", {
        body: message.body,
        headers: message.headers,
      });
    });
  }

  // ─── User room queue (/user/queue/room) ──────────────────────────────────────

  private subscribeUserRoomQueue(client: Client, config: ChatSocketStartConfig) {
    return client.subscribe(config.userQueueRoomDestination, (message) => {
      const envelope = parseEventEnvelope(message.body);
      if (!envelope) return;
      const { event, payload } = envelope;

      if (event === "subscribed.room") {
        chatSocketLog("[chat-socket] subscribed.room", payload);
        return;
      }

      if (event === "message.sendAccepted") {
        chatSocketLog("[chat-socket] message.sendAccepted", payload);
        const acceptedPayload = payload as MessageSendAcceptedPayload;
        this.pendingMessagePayloads.delete(acceptedPayload.idempotencyKey);
        this.fallbackTriggeredMessageIds.delete(acceptedPayload.idempotencyKey);
        this.emitListeners(
          this.messageSendAcceptedListeners,
          acceptedPayload,
          "messageSendAccepted",
        );
        return;
      }

      if (event === "message.sendRejected") {
        chatSocketLog("[chat-socket] message.sendRejected", payload);
        const rejectedPayload = payload as MessageSendRejectedPayload;
        this.pendingMessagePayloads.delete(rejectedPayload.idempotencyKey);
        this.fallbackTriggeredMessageIds.delete(rejectedPayload.idempotencyKey);
        this.emitListeners(
          this.messageSendRejectedListeners,
          rejectedPayload,
          "messageSendRejected",
        );
        return;
      }

      if (event === "message.sendFailed") {
        chatSocketLog("[chat-socket] message.sendFailed", payload);
        const failedPayload = payload as MessageSendFailedPayload;
        if (failedPayload.retryable) {
          this.triggerSendMessageHttpFallback(failedPayload.idempotencyKey, "message_send_failed");
        } else {
          this.pendingMessagePayloads.delete(failedPayload.idempotencyKey);
          this.fallbackTriggeredMessageIds.delete(failedPayload.idempotencyKey);
        }
        this.emitListeners(this.messageSendFailedListeners, failedPayload, "messageSendFailed");
        return;
      }

      if (event === "message.duplicate") {
        const duplicatePayload = payload as MessageDuplicatePayload;
        this.pendingMessagePayloads.delete(duplicatePayload.idempotencyKey);
        this.fallbackTriggeredMessageIds.delete(duplicatePayload.idempotencyKey);
        chatSocketLog("[chat-socket] message.duplicate", duplicatePayload);
        return;
      }

      if (event === "video.session.synced") {
        chatSocketLog("[chat-socket] video.session.synced", payload);
        this.emitListeners(
          this.videoSessionSyncedListeners,
          payload as VideoSessionSyncedPayload,
          "videoSessionSynced",
        );
        return;
      }

      if (event === "video.camera.toggleAccepted") {
        chatSocketLog("[chat-socket] video.camera.toggleAccepted", payload);
        this.emitListeners(
          this.videoCameraToggleAcceptedListeners,
          payload as VideoCameraToggleAcceptedPayload,
          "videoCameraToggleAccepted",
        );
        return;
      }

      if (event === "video.camera.toggleRejected") {
        chatSocketLog("[chat-socket] video.camera.toggleRejected", payload);
        return;
      }

      if (event === "video.token.issued") {
        chatSocketLog("[chat-socket] video.token.issued", payload);
        this.emitListeners(
          this.videoTokenIssuedListeners,
          payload as VideoTokenIssuedPayload,
          "videoTokenIssued",
        );
        return;
      }

      if (this.handleReportQueueEvent(event, payload)) {
        return;
      }

      chatSocketLog("[chat-socket] unknown room queue event", { event, body: message.body });
    });
  }

  // ─── User report queue (/user/queue/report) ─────────────────────────────────

  private subscribeUserReportQueue(client: Client, config: ChatSocketStartConfig) {
    return client.subscribe(config.userQueueReportDestination, (message) => {
      const envelope = parseEventEnvelope(message.body);
      if (!envelope) return;
      const { event, payload } = envelope;

      if (this.handleReportQueueEvent(event, payload)) {
        return;
      }

      chatSocketLog("[chat-socket] unknown report queue event", { event, body: message.body });
    });
  }

  private handleReportQueueEvent(event: string | null, payload: unknown): boolean {
    if (isExactSocketEvent(event, "report.message.created")) {
      const createdPayload = toReportMessageCreatedPayload(payload);
      if (!createdPayload) return false;

      chatSocketLog("[chat-socket] report.message.created", {
        reportId: createdPayload.reportId,
        messageId: createdPayload.messageId,
        senderType: createdPayload.senderType,
      });
      this.emitListeners(
        this.reportMessageCreatedListeners,
        createdPayload,
        "reportMessageCreated",
      );
      return true;
    }

    if (isExactSocketEvent(event, "report.message.sendAccepted")) {
      const acceptedPayload: ReportMessageSendAcceptedPayload =
        payload && typeof payload === "object"
          ? (payload as ReportMessageSendAcceptedPayload)
          : { reportId: this.pendingReportSendRequest?.payload.reportId };
      chatSocketLog("[chat-socket] report.message.sendAccepted", acceptedPayload);
      this.settlePendingReportSendAsSuccess(acceptedPayload);
      return true;
    }

    if (isExactSocketEvent(event, "report.message.sendRejected")) {
      const rejectedPayload = toReportMessageErrorPayload(payload);
      if (!rejectedPayload) return false;

      chatSocketLog("[chat-socket] report.message.sendRejected", rejectedPayload);
      this.settlePendingReportSendAsFailure({
        code: rejectedPayload.code,
        message: rejectedPayload.message,
        retryable:
          typeof rejectedPayload.retryable === "boolean" ? rejectedPayload.retryable : false,
      });
      return true;
    }

    if (isExactSocketEvent(event, "report.message.sendFailed")) {
      const failedPayload = toReportMessageErrorPayload(payload);
      if (!failedPayload) return false;

      chatSocketLog("[chat-socket] report.message.sendFailed", failedPayload);
      this.emitListeners(
        this.reportMessageSendFailedListeners,
        {
          code: failedPayload.code,
          message: failedPayload.message,
          retryable: typeof failedPayload.retryable === "boolean" ? failedPayload.retryable : false,
        },
        "reportMessageSendFailed",
      );

      if (failedPayload.retryable) {
        this.triggerReportMessageHttpFallback("report_message_send_failed");
      } else {
        this.settlePendingReportSendAsFailure({
          code: failedPayload.code,
          message: failedPayload.message,
          retryable: false,
        });
      }
      return true;
    }

    if (isExactSocketEvent(event, "report.stream.chunk")) {
      const chunkPayload = toReportStreamChunkPayload(payload);
      if (!chunkPayload) return false;

      chatSocketLog("[chat-socket] report.stream.chunk", {
        reportId: chunkPayload.reportId,
        messageId: chunkPayload.messageId,
        sequence: chunkPayload.sequence,
      });
      this.emitListeners(this.reportStreamChunkListeners, chunkPayload, "reportStreamChunk");
      return true;
    }

    if (isExactSocketEvent(event, "report.stream.start")) {
      const startPayload = toReportStreamStartPayload(payload);
      if (!startPayload) return false;

      chatSocketLog("[chat-socket] report.stream.start", {
        reportId: startPayload.reportId,
        messageId: startPayload.messageId,
        status: startPayload.status,
      });
      this.emitListeners(this.reportStreamStartListeners, startPayload, "reportStreamStart");
      return true;
    }

    if (isExactSocketEvent(event, "report.stream.end")) {
      const endPayload = toReportStreamEndPayload(payload);
      if (!endPayload) return false;

      chatSocketLog("[chat-socket] report.stream.end", {
        reportId: endPayload.reportId,
        messageId: endPayload.messageId,
        status: endPayload.status,
      });
      this.emitListeners(this.reportStreamEndListeners, endPayload, "reportStreamEnd");
      return true;
    }

    return false;
  }

  // ─── Room broadcast subscription (/sub/room/{roomId}) ────────────────────────

  private doSubscribeRoom(
    client: Client,
    config: ChatSocketStartConfig,
    roomId: number,
    entry: ActiveRoomEntry,
  ) {
    const destination = `/sub/room/${roomId}`;

    entry.stompSubscription = client.subscribe(destination, (message) => {
      const envelope = parseEventEnvelope(message.body);
      if (!envelope) return;
      const { event, payload } = envelope;

      if (event === "message.created") {
        chatSocketLog("[chat-socket] message.created", {
          roomId,
          messageId: (payload as MessageCreatedPayload)?.messageId,
        });
        entry.onMessageCreated?.(payload as MessageCreatedPayload);
        return;
      }

      if (event === "participant.joined") {
        chatSocketLog("[chat-socket] participant.joined", { roomId });
        entry.onParticipantJoined?.(payload as ParticipantJoinedPayload);
        return;
      }

      if (event === "participant.left") {
        chatSocketLog("[chat-socket] participant.left", { roomId });
        entry.onParticipantLeft?.(payload as ParticipantLeftPayload);
        return;
      }

      if (event === "lastSeenUpdated") {
        const lastSeenPayload = payload as { participantId?: number; lastSeenMessageId?: number };
        if (
          typeof lastSeenPayload.participantId === "number" &&
          typeof lastSeenPayload.lastSeenMessageId === "number"
        ) {
          const progress = this.lastSeenProgressByParticipant.get(lastSeenPayload.participantId);
          this.lastSeenProgressByParticipant.set(lastSeenPayload.participantId, {
            latestRequestedMessageId: Math.max(
              lastSeenPayload.lastSeenMessageId,
              progress?.latestRequestedMessageId ?? 0,
            ),
            latestConfirmedMessageId: Math.max(
              lastSeenPayload.lastSeenMessageId,
              progress?.latestConfirmedMessageId ?? 0,
            ),
          });
        }
        chatSocketLog("[chat-socket] lastSeenUpdated", { roomId, payload });
        return;
      }

      if (event === "video.camera.changed") {
        chatSocketLog("[chat-socket] video.camera.changed", { roomId });
        entry.onVideoCameraChanged?.(payload as VideoCameraChangedPayload);
        return;
      }

      if (event === "video.session.synced") {
        chatSocketLog("[chat-socket] video.session.synced", { roomId });
        this.emitListeners(
          this.videoSessionSyncedListeners,
          payload as VideoSessionSyncedPayload,
          "videoSessionSynced",
        );
        return;
      }

      if (event === "video.publish.started") {
        chatSocketLog("[chat-socket] video.publish.started", { roomId });
        entry.onVideoPublishStarted?.(payload as VideoPublishStartedPayload);
        return;
      }

      if (event === "video.publish.stopped") {
        chatSocketLog("[chat-socket] video.publish.stopped", { roomId });
        entry.onVideoPublishStopped?.(payload as VideoPublishStoppedPayload);
        return;
      }

      if (event === "video.participant.online") {
        chatSocketLog("[chat-socket] video.participant.online", { roomId });
        entry.onVideoParticipantOnlined?.(payload as VideoParticipantOnlinedPayload);
        return;
      }

      if (event === "video.participant.offline") {
        chatSocketLog("[chat-socket] video.participant.offline", { roomId });
        entry.onVideoParticipantOfflined?.(payload as VideoParticipantOfflinedPayload);
        return;
      }

      if (event === "video.participant.joined") {
        chatSocketLog("[chat-socket] video.participant.joined", { roomId });
        entry.onVideoParticipantJoined?.(payload as VideoParticipantJoinedPayload);
        return;
      }

      if (event === "video.participant.left") {
        chatSocketLog("[chat-socket] video.participant.left", { roomId });
        entry.onVideoParticipantLeft?.(payload as VideoParticipantLeftPayload);
        return;
      }

      if (event === "video.room.deleted") {
        chatSocketLog("[chat-socket] video.room.deleted", { roomId });
        entry.onVideoRoomDeleted?.(payload as VideoRoomDeletedPayload);
        return;
      }

      chatSocketLog("[chat-socket] unknown room broadcast event", {
        event,
        roomId,
        body: message.body,
      });
    });

    const subscribePayload: SubscribeRoomRequestPayload = {
      roomId,
      participantId: entry.participantId,
    };
    this.publishWithReceipt({
      client,
      destination: config.subscribeRoomDestination,
      body: JSON.stringify(subscribePayload),
      eventName: "subscribe.room",
      payloadForLog: subscribePayload,
    });

    chatSocketLog("[chat-socket] room subscribed", { roomId, destination });
  }

  private teardownRoomSubscription(roomId: number) {
    const entry = this.activeRooms.get(roomId);
    if (!entry) return;

    this.activeRooms.delete(roomId);

    if (this.client?.connected && this.config) {
      const unsubscribePayload: UnsubscribeRoomRequestPayload = {
        roomId,
        participantId: entry.participantId,
      };
      this.publishWithReceipt({
        client: this.client,
        destination: this.config.unsubscribeRoomDestination,
        body: JSON.stringify(unsubscribePayload),
        eventName: "unsubscribe.room",
        payloadForLog: unsubscribePayload,
      });
    }

    entry.stompSubscription?.unsubscribe();
    chatSocketLog("[chat-socket] room unsubscribed", { roomId });
  }

  // ─── Token refresh + reconnect ────────────────────────────────────────────────

  /*
   * 토큰 만료 응답 시 1회만 refresh를 시도하고 재연결한다.
   * refresh 실패 시 세션을 종료한다.
   */
  private async refreshAndReconnect() {
    if (this.isDuplicateReconnectPending) return;
    if (this.isRefreshing) return;
    this.isRefreshing = true;

    try {
      await AuthService.refresh();
      this.start();
    } catch (error) {
      chatSocketWarn("[chat-socket] refresh and reconnect failed", error);
      this.stop({
        code: "TOKEN_EXPIRED",
        message: "토큰 갱신 실패로 연결을 종료합니다.",
      });
    } finally {
      this.isRefreshing = false;
    }
  }
}

export const chatStompSession = new ChatStompSession();
