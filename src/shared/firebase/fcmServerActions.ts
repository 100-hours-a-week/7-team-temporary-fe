"use server";

import { serverFetch, serverTaskPath } from "@/shared/api/serverFetch";

export async function registerFcmTokenAction(fcmToken: string): Promise<void> {
  try {
    await serverFetch<void, { fcmToken: string; platform: "WEB" }>(serverTaskPath("/fcm-tokens"), {
      method: "POST",
      body: { fcmToken, platform: "WEB" },
    });
  } catch (error) {
    // FCM 토큰 등록 실패는 비치명적으로 처리한다.
    // Server Action이 throw하면 Next.js가 500을 반환하므로 여기서 처리한다.
    console.warn("[FCM] registerFcmToken failed:", error);
  }
}
