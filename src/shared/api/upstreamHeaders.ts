/**
 * BFF 프록시와 SSR serverFetch 양쪽에서 공유하는 업스트림 요청 헤더 빌더.
 * 정책 변경(허용 헤더 추가, 쿠키→Authorization 변환 규칙 등)은 이 파일 한 곳에서만 수정한다.
 */

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
  "x-xsrf-token",
]);

/**
 * 요청 헤더 중 업스트림 전달이 필요한 항목만 추려서 반환한다.
 * - 허용목록 외 헤더는 제거해 보안 리스크와 프록시 계층의 변동성을 줄인다.
 * - HttpOnly accessToken 쿠키를 Authorization Bearer 헤더로 변환한다.
 *   (BFF 프록시는 브라우저 요청 헤더를, SSR은 쿠키 스토어에서 구성한 Headers를 전달한다.)
 */
export function buildUpstreamRequestHeaders(source: Headers): Headers {
  const headers = new Headers();

  source.forEach((value, key) => {
    if (!REQUEST_HEADER_ALLOWLIST.has(key.toLowerCase())) return;
    headers.set(key, value);
  });

  const cookieStr = source.get("cookie") ?? "";
  const atMatch = cookieStr.match(/(?:^|;\s*)accessToken=([^;]+)/);
  if (atMatch?.[1]) {
    headers.set("Authorization", `Bearer ${atMatch[1]}`);
  }

  return headers;
}
