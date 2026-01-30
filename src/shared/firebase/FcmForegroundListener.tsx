"use client";

import { onMessage } from "firebase/messaging";
import { useEffect } from "react";

import { useToast } from "@/shared/ui/toast";
import { getFirebaseMessaging } from "./firebase";

function buildToastMessage(payload: {
  notification?: { title?: string; body?: string; content?: string };
  data?: { title?: string; body?: string; content?: string };
}) {
  const title = payload.data?.title ?? payload.notification?.title ?? "MOLIP";
  const body =
    payload.data?.content ??
    payload.data?.body ??
    payload.notification?.body ??
    payload.notification?.content ??
    "";

  return body ? `${title} - ${body}` : title;
}

export function FcmForegroundListener() {
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    const run = async () => {
      const messaging = await getFirebaseMessaging();
      if (!messaging || cancelled) return;

      unsubscribe = onMessage(messaging, (payload) => {
        console.log("[FCM] foreground payload", payload);
        showToast(buildToastMessage(payload), "info");
      });
    };

    void run();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [showToast]);

  return null;
}
