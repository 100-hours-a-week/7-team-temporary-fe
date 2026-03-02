import type { IMessage } from "@stomp/stompjs";

import type { SocketConnectedSuccessPayload } from "./handshake.types";

const SOCKET_CONNECTED_ERROR_CODES = [
  "CONNECT_UNAUTHORIZED",
  "CONNECT_TOKEN_EXPIRED",
  "CONNECT_INVALID_PAYLOAD",
] as const;

export type SocketConnectedErrorCode = (typeof SOCKET_CONNECTED_ERROR_CODES)[number];

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

  try {
    const parsed = JSON.parse(message.body) as { code?: string; status?: string; data?: string };
    return (
      toSocketConnectedErrorCode(parsed.code) ??
      toSocketConnectedErrorCode(parsed.status) ??
      toSocketConnectedErrorCode(parsed.data)
    );
  } catch {
    return null;
  }
}

export function parseConnectedSuccessPayload(
  message: IMessage,
): SocketConnectedSuccessPayload | null {
  try {
    const parsed = JSON.parse(message.body) as Partial<SocketConnectedSuccessPayload>;
    if (
      typeof parsed.sessionId === "string" &&
      typeof parsed.userId === "number" &&
      typeof parsed.connectedAt === "string" &&
      typeof parsed.serverTime === "string"
    ) {
      return {
        sessionId: parsed.sessionId,
        userId: parsed.userId,
        connectedAt: parsed.connectedAt,
        serverTime: parsed.serverTime,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function toStompHeaderErrorCode(
  headerMessage?: string,
  headerCode?: string,
): SocketConnectedErrorCode | null {
  return toSocketConnectedErrorCode(headerMessage) ?? toSocketConnectedErrorCode(headerCode);
}
