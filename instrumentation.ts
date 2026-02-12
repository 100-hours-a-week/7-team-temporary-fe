import * as Sentry from "@sentry/nextjs";

const sentryOptions: Parameters<typeof Sentry.init>[0] = {
  dsn: "https://22003de6335a4b8ca1270fe5fd03c0bb@o4510866997379072.ingest.us.sentry.io/4510866998820864",
  tracesSampleRate: 1,
  enableLogs: true,
  sendDefaultPii: true,
};

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init(sentryOptions);
  }
}

export const onRequestError = Sentry.captureRequestError;
