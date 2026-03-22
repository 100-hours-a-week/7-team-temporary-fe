import { getFirebaseMessaging } from "./firebase";

type RequestFcmTokenOptions = {
  promptPermission?: boolean;
};

export async function requestFcmToken(options: RequestFcmTokenOptions = {}) {
  const { promptPermission = true } = options;

  if (Notification.permission !== "granted") {
    if (!promptPermission) {
      return null;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return null;
    }
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    return null;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    return null;
  }
  if (!registration.active) {
    await navigator.serviceWorker.ready;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    return null;
  }

  const { getToken } = await import("firebase/messaging");
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    return null;
  }

  return token;
}
