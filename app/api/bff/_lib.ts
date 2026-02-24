import type { NextRequest } from "next/server";

const REQUEST_HEADER_ALLOWLIST = new Set([
  "accept",
  "accept-language",
  "authorization",
  "content-type",
  "cookie",
  "if-match",
  "if-none-match",
  "user-agent",
  "x-correlation-id",
  "x-request-id",
]);

const RESPONSE_HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

type HeadersWithGetSetCookie = Headers & {
  getSetCookie?: () => string[];
  raw?: () => Record<string, string[]>;
};

export type ProxyTargetKind = "task" | "chat" | "legacy";

function getHostFromUrl(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

function normalizeSetCookieForClient(cookie: string, req: NextRequest, upstreamBase: string) {
  let normalized = cookie;
  const upstreamHost = upstreamBase ? getHostFromUrl(upstreamBase) : null;
  const clientHost = req.nextUrl.host;

  // Upstream 도메인과 클라이언트 도메인이 다르면 Domain 속성은 브라우저에서 거부될 수 있다.
  if (upstreamHost && upstreamHost !== clientHost) {
    normalized = normalized.replace(/;\s*Domain=[^;]*/gi, "");
  }

  // localhost(http) 개발환경에서는 Secure + SameSite=None 쿠키가 저장 거부될 수 있어 보정한다.
  const isLocalHttp =
    req.nextUrl.protocol === "http:" &&
    (req.nextUrl.hostname === "localhost" || req.nextUrl.hostname === "127.0.0.1");

  if (isLocalHttp) {
    normalized = normalized.replace(/;\s*Secure/gi, "");
    normalized = normalized.replace(/;\s*SameSite=None/gi, "; SameSite=Lax");
  }

  return normalized;
}

function splitCombinedSetCookieHeader(headerValue: string) {
  const cookies: string[] = [];
  let tokenStart = 0;
  let inExpires = false;

  for (let i = 0; i < headerValue.length; i += 1) {
    const remaining = headerValue.slice(i).toLowerCase();

    if (!inExpires && remaining.startsWith("expires=")) {
      inExpires = true;
      continue;
    }

    const ch = headerValue[i];

    if (inExpires && ch === ";") {
      inExpires = false;
      continue;
    }

    if (!inExpires && ch === ",") {
      const part = headerValue.slice(tokenStart, i).trim();
      if (part) cookies.push(part);
      tokenStart = i + 1;
    }
  }

  const tail = headerValue.slice(tokenStart).trim();
  if (tail) cookies.push(tail);
  return cookies;
}

function ensureTrailingSlash(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}

function getTaskProxyTarget() {
  const taskTarget =
    process.env.API_PROXY_TASK_TARGET?.trim() || process.env.API_PROXY_TARGET?.trim();
  if (!taskTarget) {
    throw new Error("API_PROXY_TASK_TARGET (or API_PROXY_TARGET) is required");
  }
  return taskTarget;
}

function getChatProxyTarget() {
  const chatTarget =
    process.env.API_PROXY_CHAT_TARGET?.trim() || process.env.API_PROXY_TARGET?.trim();
  if (!chatTarget) {
    throw new Error("API_PROXY_CHAT_TARGET (or API_PROXY_TARGET) is required");
  }
  return chatTarget;
}

export function getProxyTarget(kind: ProxyTargetKind) {
  if (kind === "chat") {
    return getChatProxyTarget();
  }

  return getTaskProxyTarget();
}

/**
 * 프록시 kind(task/chat/legacy)와 경로 세그먼트를 기반으로 업스트림 URL을 생성한다.
 * task/chat은 분리된 타깃 환경변수를 사용하고, legacy는 task 타깃으로 호환된다.
 */
export function buildBackendUrl(req: NextRequest, path: string[], kind: ProxyTargetKind) {
  const base = getProxyTarget(kind);

  const upstreamUrl = new URL(path.join("/"), ensureTrailingSlash(base));
  upstreamUrl.search = req.nextUrl.search;
  return upstreamUrl.toString();
}

/**
 * 브라우저 요청 헤더 중 업스트림 전달이 필요한 항목만 추려서 만든다.
 * Cookie/Authorization/Content-Type 같은 인증·요청 의미 보존 헤더만 유지하고
 * 나머지 헤더는 전달하지 않아 프록시 계층의 변동성과 보안 리스크를 줄인다.
 */
export function buildUpstreamRequestHeaders(source: Headers) {
  const headers = new Headers();

  source.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (!REQUEST_HEADER_ALLOWLIST.has(lowerKey)) {
      return;
    }
    headers.set(key, value);
  });

  return headers;
}

/**
 * 업스트림 응답 헤더를 브라우저로 재전달 가능한 형태로 변환한다.
 * hop-by-hop 헤더는 제거하고, Set-Cookie는 단일/복수 케이스를 분기해 append 하여
 * 리프레시 토큰 쿠키가 손실되지 않도록 보존한다.
 */
export function buildClientResponseHeaders(
  source: Headers,
  req: NextRequest,
  upstreamBase: string,
) {
  const headers = new Headers();
  const sourceHeaders = source as HeadersWithGetSetCookie;

  source.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (RESPONSE_HOP_BY_HOP_HEADERS.has(lowerKey) || lowerKey === "set-cookie") {
      return;
    }
    headers.set(key, value);
  });

  const setCookiesFromGetter =
    typeof sourceHeaders.getSetCookie === "function" ? sourceHeaders.getSetCookie() : [];

  const setCookiesFromRaw =
    setCookiesFromGetter.length === 0 && typeof sourceHeaders.raw === "function"
      ? (sourceHeaders.raw()?.["set-cookie"] ?? [])
      : [];

  const setCookies = setCookiesFromGetter.length > 0 ? setCookiesFromGetter : setCookiesFromRaw;

  if (setCookies.length > 0) {
    setCookies.forEach((cookie) =>
      headers.append("set-cookie", normalizeSetCookieForClient(cookie, req, upstreamBase)),
    );
    return headers;
  }

  const singleCookie = source.get("set-cookie");
  if (singleCookie) {
    splitCombinedSetCookieHeader(singleCookie).forEach((cookie) =>
      headers.append("set-cookie", normalizeSetCookieForClient(cookie, req, upstreamBase)),
    );
  }

  return headers;
}
