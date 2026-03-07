// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

type SentryModule = typeof import("@sentry/nextjs");

const sentryDsn =
  "https://22003de6335a4b8ca1270fe5fd03c0bb@o4510866997379072.ingest.us.sentry.io/4510866998820864";

let sentryPromise: Promise<SentryModule> | null = null;

function loadSentry() {
  if (!sentryPromise) {
    sentryPromise = import("@sentry/nextjs");
  }
  return sentryPromise;
}

function initSentry() {
  void loadSentry().then((Sentry) => {
    Sentry.init({
      dsn: sentryDsn,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
      enableLogs: false,
      sendDefaultPii: true,
    });
  });
}

if (typeof window !== "undefined") {
  // 초기 렌더 이후로 Sentry 초기화를 미뤄 메인 스레드 블로킹을 줄인다.
  window.setTimeout(initSentry, 1500);
}

export function onRouterTransitionStart(...args: unknown[]) {
  void loadSentry().then((Sentry) => {
    const capture = Sentry.captureRouterTransitionStart as
      | ((...params: unknown[]) => void)
      | undefined;
    capture?.(...args);
  });
}
