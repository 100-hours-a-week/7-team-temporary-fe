import { ApiError, COMMON_ERROR_CODE, CommonError } from "@/shared/api";
import {
  JOIN_CHAT_ROOM_FAILURE_MESSAGE,
  JOIN_CHAT_ROOM_NETWORK_ERROR_MESSAGE,
  JOIN_CHAT_ROOM_SERVER_ERROR_MESSAGE,
} from "./chatSearch.constants";

function toNumericValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function resolveParticipantIdFromAccessToken(accessToken?: string): number | null {
  if (!accessToken) return null;
  const rawToken = accessToken.startsWith("Bearer ") ? accessToken.slice(7) : accessToken;
  const segments = rawToken.split(".");
  if (segments.length < 2) return null;

  try {
    const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(`${base64}${padding}`);
    const payload = JSON.parse(decoded) as Record<string, unknown>;
    return (
      toNumericValue(payload.participantId) ??
      toNumericValue(payload.userId) ??
      toNumericValue(payload.sub)
    );
  } catch {
    return null;
  }
}

export function getJoinChatRoomErrorMessage(error: unknown) {
  if (error instanceof CommonError) {
    if (error.code === COMMON_ERROR_CODE.NETWORK_ERROR) {
      return JOIN_CHAT_ROOM_NETWORK_ERROR_MESSAGE;
    }
    if (error.code === COMMON_ERROR_CODE.INTERNAL_SERVER_ERROR) {
      return JOIN_CHAT_ROOM_SERVER_ERROR_MESSAGE;
    }
    return error.userMessage;
  }

  if (error instanceof ApiError && error.httpStatus >= 500) {
    return JOIN_CHAT_ROOM_SERVER_ERROR_MESSAGE;
  }

  if (error instanceof TypeError) {
    return JOIN_CHAT_ROOM_NETWORK_ERROR_MESSAGE;
  }

  return JOIN_CHAT_ROOM_FAILURE_MESSAGE;
}
