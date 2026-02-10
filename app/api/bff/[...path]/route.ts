import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildBackendUrl, buildClientResponseHeaders, buildUpstreamRequestHeaders } from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

type HeadersWithSetCookieIntrospection = Headers & {
  getSetCookie?: () => string[];
  raw?: () => Record<string, string[]>;
};

function canHaveBody(method: string) {
  return method !== "GET" && method !== "HEAD";
}

function getSetCookieValues(headers: Headers) {
  const introspectable = headers as HeadersWithSetCookieIntrospection;

  if (typeof introspectable.getSetCookie === "function") {
    return introspectable.getSetCookie();
  }

  if (typeof introspectable.raw === "function") {
    return introspectable.raw()?.["set-cookie"] ?? [];
  }

  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

function getCookieName(cookie: string) {
  return cookie.split("=")[0]?.trim();
}

function isRefreshTokenRoute(path: string[], method: string) {
  return method === "PUT" && path.join("/") === "token";
}

async function proxy(req: NextRequest, path: string[]) {
  const upstreamUrl = buildBackendUrl(req, path);
  const requestHeaders = buildUpstreamRequestHeaders(req.headers);

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: req.method,
      headers: requestHeaders,
      body: canHaveBody(req.method) ? await req.arrayBuffer() : undefined,
      redirect: "manual",
      signal: req.signal,
    });

    const clientHeaders = buildClientResponseHeaders(upstreamResponse.headers, req);

    if (isRefreshTokenRoute(path, req.method)) {
      const responseSetCookies = getSetCookieValues(clientHeaders);
      const responseCookieNames = [
        ...new Set(responseSetCookies.map(getCookieName).filter(Boolean)),
      ];

      console.info("[bff] refresh exchange", {
        status: upstreamResponse.status,
        requestHasRefreshToken: (req.headers.get("cookie") ?? "").includes("refreshToken="),
        responseSetCookieCount: responseSetCookies.length,
        responseSetCookieNames: responseCookieNames,
        upstreamSetCookiePresent: Boolean(upstreamResponse.headers.get("set-cookie")),
        upstreamUrl,
      });
    }

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: clientHeaders,
    });
  } catch (error) {
    console.error("[bff] upstream request failed", {
      method: req.method,
      upstreamUrl,
      error,
    });

    return NextResponse.json(
      {
        status: "FAIL",
        code: "UPSTREAM_UNAVAILABLE",
        message: "일시적으로 서버에 연결할 수 없습니다.",
      },
      { status: 502 },
    );
  }
}

async function handle(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

/**
 * GET 요청용 Route Handler 엔트리.
 * Next.js가 매칭한 path 파라미터를 공통 프록시 함수로 전달해
 * 동일한 전달/응답 규칙으로 처리한다.
 */
export async function GET(req: NextRequest, ctx: RouteContext) {
  return handle(req, ctx);
}

/**
 * POST 요청용 Route Handler 엔트리.
 * 로그인/토큰 발급처럼 바디가 필요한 요청도 공통 프록시로 위임한다.
 */
export async function POST(req: NextRequest, ctx: RouteContext) {
  return handle(req, ctx);
}

/**
 * PUT 요청용 Route Handler 엔트리.
 * 토큰 갱신 등 멱등 수정 요청을 공통 프록시 경로로 처리한다.
 */
export async function PUT(req: NextRequest, ctx: RouteContext) {
  return handle(req, ctx);
}

/**
 * PATCH 요청용 Route Handler 엔트리.
 * 부분 수정 API 호출을 별도 로직 없이 공통 프록시로 통합한다.
 */
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return handle(req, ctx);
}

/**
 * DELETE 요청용 Route Handler 엔트리.
 * 로그아웃/삭제 API 응답의 상태 코드와 헤더를 그대로 전달한다.
 */
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return handle(req, ctx);
}

/**
 * HEAD 요청용 Route Handler 엔트리.
 * 바디 없이 헤더 기반 확인 요청을 공통 프록시 규칙으로 처리한다.
 */
export async function HEAD(req: NextRequest, ctx: RouteContext) {
  return handle(req, ctx);
}

/**
 * OPTIONS 요청용 Route Handler 엔트리.
 * preflight 또는 메서드 질의 요청을 업스트림에 그대로 전달한다.
 */
export async function OPTIONS(req: NextRequest, ctx: RouteContext) {
  return handle(req, ctx);
}
