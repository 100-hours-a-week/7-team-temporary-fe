import type { ChatMessageSenderType, ChatMessageType } from "@/shared/model";

// ─── Handshake: Client → Server ──────────────────────────────────────────────

export interface DisconnectHandshakePayload {
  code: string;
  message: string;
}

export interface SubscribeUserRequestPayload {
  requestedAt: string;
}

export interface SubscribeRoomRequestPayload {
  roomId: number;
  participantId: number;
}

export interface UnsubscribeRoomRequestPayload {
  roomId: number;
  participantId: number;
}

export interface MessageSendPayload {
  idempotencyKey: string;
  roomId: number;
  messageType: ChatMessageType;
  content: string | null;
  imageKeys: string[];
}

export interface ReportMessageSendPayload {
  reportId: number;
  inputMessage: string;
}

export interface LastSeenUpdatePayload {
  participantId: number;
  lastSeenMessageId: number;
}

export interface SocketPongPayload {
  timestamp: string;
}

// ─── Handshake: Server → Client (/user/queue/handshake) ──────────────────────

export interface SocketConnectedSuccessPayload {
  sessionId: string;
  userId: number;
  connectedAt: string;
  serverTime: string;
}

export interface SocketPingPayload {
  timestamp: string;
}

export interface SocketServerDisconnectPayload {
  code: string;
  message: string;
}

export interface SocketReconnectRequiredPayload {
  code: string;
  message: string;
  retryAfterMs: number;
}

export interface SocketResyncRequiredPayload {
  scope: string;
  roomId?: number;
  fromMessageId?: number;
}

// ─── User queue: Server → Client (/user/queue/user) ──────────────────────────

export interface SubscribedUserEventPayload {
  userId: number;
  subscribedAt: string;
}

export interface UnreadChangedUserEventPayload {
  eventId: string;
  userId: number;
  roomId: number;
  unreadCount?: number;
  lastUserMessagePreview?: string | null;
  lastUserMessageSentAt?: string | null;
  participantsCount?: number;
}

// ─── Room queue: Server → Client (/user/queue/room) ──────────────────────────

export interface SubscribedRoomEventPayload {
  roomId: number;
  participantId: number;
  subscribedAt: string;
}

export interface MessageSendAcceptedPayload {
  idempotencyKey: string;
  messageId: number;
  status: string;
  sentAt: string;
}

export interface MessageSendRejectedPayload {
  idempotencyKey: string;
  code: string;
  message: string;
  retryable: false;
}

export interface MessageSendFailedPayload {
  idempotencyKey: string;
  code: string;
  message: string;
  retryable: boolean;
}

export interface MessageDuplicatePayload {
  idempotencyKey: string;
  messageId: number;
  status: string;
}

// ─── Report queue: Server → Client (/user/queue/report) ───────────────────────

export interface ReportMessageSendAcceptedPayload {
  reportId?: number;
  message?: string;
}

export interface ReportMessageSendRejectedPayload {
  code: string;
  message: string;
  retryable?: boolean;
}

export interface ReportMessageSendFailedPayload {
  code: string;
  message: string;
  retryable: boolean;
}

export interface ReportMessageCreatedPayload {
  eventId: string;
  reportId: number;
  messageId: number;
  senderType: "USER" | "AI" | "SYSTEM";
  messageType: "TEXT" | "IMAGE";
  content: string | null;
  sentAt: string;
}

export interface ReportStreamStartPayload {
  reportId: number;
  messageId: number;
  senderType: "USER" | "AI" | "SYSTEM";
  messageType: "TEXT" | "IMAGE";
  status?: string;
}

export interface ReportStreamChunkPayload {
  reportId: number;
  messageId: number;
  senderType: "USER" | "AI" | "SYSTEM";
  messageType: "TEXT" | "IMAGE";
  delta: string;
  sequence: number;
}

export interface ReportStreamEndPayload {
  reportId: number;
  messageId: number;
  senderType: "USER" | "AI" | "SYSTEM";
  messageType: "TEXT" | "IMAGE";
  status?: string;
  content?: string | null;
}

// ─── Chat participant presence: Client → Server ───────────────────────────────

export interface ChatParticipantOnlinePayload {
  roomId: number;
  participantId: number;
  sessionId: string;
}

export interface ChatParticipantHeartbeatPayload {
  roomId: number;
  participantId: number;
  sessionId: string;
}

export interface ChatParticipantOfflinePayload {
  roomId: number;
  participantId: number;
  sessionId: string;
}

// ─── Video: Client → Server ───────────────────────────────────────────────────

export interface VideoParticipantOnlinePayload {
  roomId: number;
  participantId: number;
  sessionId: string;
  cameraEnabled: boolean;
}

export interface VideoParticipantHeartbeatPayload {
  roomId: number;
  participantId: number;
  sessionId: string;
}

export interface VideoParticipantOfflinePayload {
  roomId: number;
  participantId: number;
  sessionId: string;
}

// ─── Video: Room broadcast (/sub/room/{roomId}) ───────────────────────────────

export interface VideoParticipantOnlinedPayload {
  eventId: string;
  roomId: number;
  participantId: number;
  userId: number;
  nickname: string;
  sessionId: string;
  cameraEnabled: boolean;
  at: string;
}

export interface VideoParticipantOfflinedPayload {
  eventId: string;
  roomId: number;
  participantId: number;
  userId: number;
  nickname: string;
  sessionId: string;
  cameraEnabled: boolean;
  at: string;
}

export interface VideoParticipantJoinedPayload {
  eventId: string;
  roomId: number;
  participantId: number;
  userId: number;
  nickname: string;
  joinedAt: string;
  cameraEnabled: boolean;
}

export interface VideoParticipantLeftPayload {
  eventId: string;
  roomId: number;
  participantId: number;
  userId: number;
  leftAt: string;
}

export interface VideoCameraChangedPayload {
  eventId: string;
  roomId: number;
  participantId: number;
  userId: number;
  cameraEnabled: boolean;
}

export interface VideoPublishStartedPayload {
  eventId: string;
  roomId: number;
  participantId: number;
  userId: number;
  sessionId: string;
}

export interface VideoPublishStoppedPayload {
  eventId: string;
  roomId: number;
  participantId: number;
  userId: number;
  sessionId: string;
}

export interface VideoRoomDeletedPayload {
  eventId: string;
  roomId: number;
}

// ─── Video: User queue (/user/queue/room) ─────────────────────────────────────

export interface VideoSessionSyncedPayload {
  eventId?: string;
  roomId: number;
  participantId: number;
  sessionId: string;
  published: boolean;
  at?: string;
}

export interface VideoCameraToggleAcceptedPayload {
  eventId: string;
  participantId: number;
  cameraEnabled: boolean;
}

export interface VideoTokenIssuedPayload {
  eventId: string;
  accessToken: string;
  expiresAt: string;
}

// ─── Room broadcast: Server → Client (/sub/room/{roomId}) ────────────────────

export interface MessageCreatedPayload {
  eventId: string;
  messageId: number;
  roomId: number;
  messageType: ChatMessageType;
  senderType: ChatMessageSenderType;
  senderId: number | null;
  senderNickname?: string | null;
  senderProfile?: {
    url: string;
    expiresAt?: string | null;
    key?: string;
  } | null;
  content: string | null;
  images: Array<{ url: string; key: string; sortOrder: number; expiresAt?: string }>;
  sentAt: string;
}

export interface ParticipantJoinedPayload {
  eventId: string;
  roomId: number;
  participantId: number;
  userId: number;
  nickname: string;
  joinedAt: string;
}

export interface ParticipantLeftPayload {
  eventId: string;
  roomId: number;
  participantId: number;
  userId: number;
  leftAt: string;
}
