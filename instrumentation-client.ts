// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

type SentryModule = typeof import("@sentry/nextjs");

const sentryDsn =
  "https://22003de6335a4b8ca1270fe5fd03c0bb@o4510866997379072.ingest.us.sentry.io/4510866998820864";

let sentryPromise: Promise<SentryModule> | null = null;

function loadSentry() {
  if (!sentryPromise) {
    // webpackPrefetch: false → Next.js가 자동으로 prefetch link를 추가하지 않음
    sentryPromise = import(/* webpackPrefetch: false */ "@sentry/nextjs");
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
  // requestIdleCallback: CPU가 한가할 때 실행 → LCP/FID에 영향 없음
  // timeout: 5000ms → idle이 안 와도 5초 후엔 강제 실행
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(() => initSentry(), { timeout: 5000 });
  } else {
    window.setTimeout(initSentry, 2000);
  }
}

export function onRouterTransitionStart(...args: unknown[]) {
  void loadSentry().then((Sentry) => {
    const capture = Sentry.captureRouterTransitionStart as
      | ((...params: unknown[]) => void)
      | undefined;
    capture?.(...args);
  });
}
