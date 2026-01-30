import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";

type RequestFcmTokenOptions = {
  promptPermission?: boolean;
};

export async function requestFcmToken(options: RequestFcmTokenOptions = {}) {
  const { promptPermission = true } = options;

  if (Notification.permission !== "granted") {
    if (!promptPermission) {
      console.log("[FCM] permission not granted");
      return null;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("[FCM] permission denied");
      return null;
    }
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    console.log("[FCM] messaging not supported");
    return null;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    console.log("[FCM] service worker not registered");
    return null;
  }
  if (!registration.active) {
    await navigator.serviceWorker.ready;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.log("[FCM] missing NEXT_PUBLIC_FIREBASE_VAPID_KEY");
    return null;
  }

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    console.log("[FCM] token not issued");
    return null;
  }

  console.log("[FCM] token issued:", token);
  return token;
}
