import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  buildBackendUrl,
  buildClientResponseHeaders,
  buildUpstreamRequestHeaders,
  getProxyTarget,
} from "../bff/_lib";

/**
 * AT HttpOnly 쿠키를 백엔드에 실제로 검증하고, 소켓 핸드셰이크에 필요한 deviceId를 반환한다.
 * 백엔드 응답의 Set-Cookie(XSRF-TOKEN 포함)를 브라우저로 포워딩하여
 * restoreFromCookie() 경로에서도 XSRF-TOKEN이 세팅되도록 보장한다.
 */
export async function GET(req: NextRequest) {
  const upstreamBase = getProxyTarget("task");
  const upstreamUrl = buildBackendUrl(req, ["users"], "task");
  const requestHeaders = buildUpstreamRequestHeaders(req.headers);

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: "GET",
      headers: requestHeaders,
    });
  } catch {
    return NextResponse.json({ error: "upstream_unavailable" }, { status: 502 });
  }

  if (!upstreamResponse.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: upstreamResponse.status });
  }

  const clientHeaders = buildClientResponseHeaders(upstreamResponse.headers, req, upstreamBase);
  const deviceId = req.cookies.get("deviceId")?.value ?? null;

  return NextResponse.json({ deviceId }, { headers: clientHeaders });
}
