import type { IMessage } from "@stomp/stompjs";

import type { SocketConnectedSuccessPayload } from "./handshake.types";

const SOCKET_CONNECTED_ERROR_CODES = [
  "CONNECT_UNAUTHORIZED",
  "CONNECT_TOKEN_EXPIRED",
  "CONNECT_INVALID_PAYLOAD",
] as const;

export type SocketConnectedErrorCode = (typeof SOCKET_CONNECTED_ERROR_CODES)[number];

type JsonRecord = Record<string, unknown>;

function parseJsonRecord(raw: string): JsonRecord | null {
  try {
    const parsed = JSON.parse(raw.replace(/\u0000/g, "")) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as JsonRecord;
  } catch {
    return null;
  }
}

function toConnectedPayload(candidate: unknown): SocketConnectedSuccessPayload | null {
  if (!candidate || typeof candidate !== "object") return null;
  const value = candidate as Partial<SocketConnectedSuccessPayload>;
  if (
    typeof value.sessionId === "string" &&
    typeof value.userId === "number" &&
    typeof value.connectedAt === "string" &&
    typeof value.serverTime === "string"
  ) {
    return {
      sessionId: value.sessionId,
      userId: value.userId,
      connectedAt: value.connectedAt,
      serverTime: value.serverTime,
    };
  }
  return null;
}

function toSocketConnectedErrorCode(
  value: string | null | undefined,
): SocketConnectedErrorCode | null {
  if (!value) return null;
  return SOCKET_CONNECTED_ERROR_CODES.includes(value as SocketConnectedErrorCode)
    ? (value as SocketConnectedErrorCode)
    : null;
}

export function parseConnectedErrorCode(message: IMessage): SocketConnectedErrorCode | null {
  const direct = toSocketConnectedErrorCode(message.body?.trim());
  if (direct) return direct;

  const parsed = parseJsonRecord(message.body);
  if (!parsed) return null;
  return (
    toSocketConnectedErrorCode(typeof parsed.code === "string" ? parsed.code : null) ??
    toSocketConnectedErrorCode(typeof parsed.status === "string" ? parsed.status : null) ??
    toSocketConnectedErrorCode(typeof parsed.data === "string" ? parsed.data : null)
  );
}

export function parseConnectedSuccessPayload(
  message: IMessage,
): SocketConnectedSuccessPayload | null {
  const parsed = parseJsonRecord(message.body);
  if (!parsed) return null;

  const topLevel = toConnectedPayload(parsed);
  if (topLevel) return topLevel;

  return toConnectedPayload(parsed.payload);
}

export function toStompHeaderErrorCode(
  headerMessage?: string,
  headerCode?: string,
): SocketConnectedErrorCode | null {
  return toSocketConnectedErrorCode(headerMessage) ?? toSocketConnectedErrorCode(headerCode);
}
