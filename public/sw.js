/* eslint-disable no-undef */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
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

/*백그라운드 푸시는 이쪽에서 받는다.*/
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log("[FCM SW] payload", payload);

    const title = payload.data?.title ?? "MOLIP";
    const body = payload.data?.content ?? payload.data?.body ?? "백그라운드 푸시 알림 테스트!";
    const icon = payload.data?.icon ?? "/icons/icon.svg";

    self.registration.showNotification(title, {
      body,
      icon,
    });
  });
}

// Fallback for non-FCM test pushes (DevTools "Push" may send plain text)
/*백엔드가 보내는 푸시는 이쪽에서 받는다.
 *
 */
self.addEventListener("push", (event) => {
  console.log("[FCM SW] push event", event);
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { title: "MOLIP", content: event.data.text() };
    }
  }

  const title = payload.data?.title ?? "MOLIP";
  const body = payload.data?.content ?? payload.data?.body ?? "push 푸시 알림 테스트";
  const icon = payload.data?.icon ?? "/icons/icon.svg";
  const badge = payload.data?.badge ?? "/icons/badge.svg";

  event.waitUntil(self.registration.showNotification(title, { body, icon, badge }));
});
