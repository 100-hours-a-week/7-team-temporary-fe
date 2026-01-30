export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator)) return null;

  const isDev = process.env.NODE_ENV !== "production";
  const enableInDev = process.env.NEXT_PUBLIC_ENABLE_SW === "true";
  if (isDev && !enableInDev) return null;

  try {
    const existing = await navigator.serviceWorker.getRegistration();
    if (existing) return existing;
    return await navigator.serviceWorker.register("/sw.js");
  } catch (error) {
    console.error("[SW] registration failed", error);
    return null;
  }
}
