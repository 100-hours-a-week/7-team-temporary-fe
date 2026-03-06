import { isChatSocketLogEnabled } from "./socketEnv";

export function chatSocketLog(message: string, payload?: unknown) {
  if (!isChatSocketLogEnabled()) return;
  if (typeof payload === "undefined") {
    console.log(message);
    return;
  }
  console.log(message, payload);
}

export function resolveStompDebugLogger() {
  if (!isChatSocketLogEnabled()) return undefined;
  return (message: string) => console.log("[chat-socket:stomp]", message);
}
