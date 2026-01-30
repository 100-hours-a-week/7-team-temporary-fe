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

if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title ?? payload.data?.title ?? "MOLIP";
    const body = payload.notification?.body ?? payload.data?.body ?? "푸시 알림 테스트";
    const icon = payload.notification?.icon ?? payload.data?.icon ?? "/icons/icon.svg";

    console.log(payload);
    self.registration.showNotification(title, { body, icon });
  });
}

// Fallback for non-FCM test pushes
self.addEventListener("push", (event) => {
  event.waitUntil(
    self.registration.showNotification("MOLIP", {
      body: "푸시 알림 테스트",
      icon: "/icons/icon.svg",
    }),
  );
});
