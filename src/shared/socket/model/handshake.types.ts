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
  content: string;
  imageKeys: string[];
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

export interface ChatSummaryChangedUserEventPayload {
  eventId: string;
  userId: number;
  roomId: number;
  changedFields: string[];
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

// ─── Room broadcast: Server → Client (/sub/room/{roomId}) ────────────────────

export interface MessageCreatedPayload {
  eventId: string;
  messageId: number;
  roomId: number;
  messageType: ChatMessageType;
  senderType: ChatMessageSenderType;
  senderId: number | null;
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
