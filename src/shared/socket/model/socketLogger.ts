import { isChatSocketLogEnabled } from "./socketEnv";

export function chatSocketLog(_message: string, _payload?: unknown) {
  if (!isChatSocketLogEnabled()) return;
}

export function resolveStompDebugLogger() {
  if (!isChatSocketLogEnabled()) return () => undefined;
  return () => undefined;
}

export function chatSocketWarn(message: string, payload?: unknown) {
  if (!isChatSocketLogEnabled()) return;
  if (typeof payload === "undefined") {
    console.warn(message);
    return;
  }
  console.warn(message, payload);
}

export function chatSocketError(message: string, payload?: unknown) {
  if (!isChatSocketLogEnabled()) return;
  if (typeof payload === "undefined") {
    console.error(message);
    return;
  }
  console.error(message, payload);
}
