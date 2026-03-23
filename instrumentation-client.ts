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
  // LCP 완료 후 Sentry 로드 — requestIdleCallback은 LCP 이전 idle 시점에 발동해
  // 9697(Feedback) 등 Sentry 청크 컴파일이 Long Task로 LCP를 블로킹하는 문제 방지.
  // setTimeout 2s: LCP가 통상 1s 이내이므로 충분한 여유를 두고 초기화
  window.setTimeout(initSentry, 2000);
}

export function onRouterTransitionStart(...args: unknown[]) {
  void loadSentry().then((Sentry) => {
    const capture = Sentry.captureRouterTransitionStart as
      | ((...params: unknown[]) => void)
      | undefined;
    capture?.(...args);
  });
}
