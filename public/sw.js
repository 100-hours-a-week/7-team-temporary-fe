/* eslint-disable no-undef */

// _next/static/* 는 content hash 기반 불변 파일 → Cache-First 전략
const STATIC_CACHE = "molip-static-v2";
const APP_ICON_PATH = "/icons/icon-v2.svg";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.add(APP_ICON_PATH))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  // 이전 버전 캐시 정리
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isNextStaticAsset = url.pathname.startsWith("/_next/static/");
  const isAppIcon = url.pathname === APP_ICON_PATH;
  if (!isNextStaticAsset && !isAppIcon) return;

  event.respondWith(
    caches.open(STATIC_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;

      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    }),
  );
});

let messaging = null;

// Firebase (Messaging) in Service Worker uses importScripts (no ES module imports here)
try {
  importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

  if (typeof firebase !== "undefined") {
    firebase.initializeApp({
      apiKey: "AIzaSyC6UawKnTWegaQXrsLJHlsk2j3J1yp9-QA",
      authDomain: "molip-5f18a.firebaseapp.com",
      projectId: "molip-5f18a",
      storageBucket: "molip-5f18a.firebasestorage.app",
      messagingSenderId: "963258599698",
      appId: "1:963258599698:web:47179c07e84522e7504bcb",
    });

    messaging = firebase.messaging();
  }
} catch (error) {
  console.warn("[SW] Firebase messaging setup failed", error);
}

/** FCM data payload → 알림 옵션으로 변환
 *  FCM data-only 메시지는 모든 필드가 payload.data 아래 string으로 들어온다.
 */
function buildNotificationOptions(data) {
  const title = data?.title ?? "MOLIP";
  const body = data?.body ?? data?.messagePreview ?? data?.content ?? "";
  const icon = "/icons/icon-v2.svg";
  const badge = "/icons/badge.svg";

  return {
    title,
    options: {
      body,
      icon,
      badge,
      tag: data?.notificationId ?? data?.roomId ?? "molip",
      renotify: true,
      data: {
        type: data?.type,
        roomId: data?.roomId,
        messageId: data?.messageId,
        notificationId: data?.notificationId,
      },
    },
  };
}

/* 백그라운드 FCM 메시지 수신 (앱이 백그라운드/종료 상태일 때) */
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    const { title, options } = buildNotificationOptions(payload.data);
    self.registration.showNotification(title, options);
  });
}

/* 직접 Push API 이벤트 (FCM 이외 경로 또는 DevTools 테스트) */
self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      const json = event.data.json();
      // FCM 래핑: { data: { ... } } 또는 flat 구조 모두 대응
      data = json.data ?? json;
    } catch {
      data = { body: event.data.text() };
    }
  }

  const { title, options } = buildNotificationOptions(data);
  event.waitUntil(self.registration.showNotification(title, options));
});

/* 알림 클릭 시 해당 채팅방으로 이동 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { type, roomId } = event.notification.data ?? {};
  const targetPath = type === "CHAT_MESSAGE" && roomId ? `/room/${roomId}` : "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 이미 열린 탭이 있으면 포커스 후 이동
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            client.navigate(targetPath);
            return;
          }
        }
        // 열린 탭이 없으면 새 탭 열기
        return self.clients.openWindow(targetPath);
      }),
  );
});
