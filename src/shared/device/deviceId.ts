import { createUuid } from "@/shared/lib";

const DEVICE_ID_STORAGE_KEY = "deviceId";

/**
 * localStorage에 저장된 deviceId를 반환하거나 없으면 새로 생성해 저장한다.
 * 로그인 요청 및 WebSocket STOMP 핸드셰이크에 공통으로 사용된다.
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "server";

  try {
    const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existing) return existing;

    const created = createUuid();
    window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, created);
    return created;
  } catch (error) {
    console.warn("[device] deviceId storage failed", error);
    return createUuid();
  }
}
