import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  buildBackendUrl,
  buildClientResponseHeaders,
  buildUpstreamRequestHeaders,
  getProxyTarget,
  type ProxyTargetKind,
} from "../bff/_lib";

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

async function proxy(req: NextRequest, path: string[], kind: ProxyTargetKind) {
  const upstreamBase = getProxyTarget(kind);
  const upstreamUrl = buildBackendUrl(req, path, kind);
  const requestHeaders = buildUpstreamRequestHeaders(req.headers);

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: req.method,
      headers: requestHeaders,
      body: canHaveBody(req.method) ? await req.arrayBuffer() : undefined,
      redirect: "manual",
      signal: req.signal,
    });

    const clientHeaders = buildClientResponseHeaders(upstreamResponse.headers, req, upstreamBase);

    if (isRefreshTokenRoute(path, req.method)) {
      const responseSetCookies = getSetCookieValues(clientHeaders);
      const responseCookieNames = [
        ...new Set(responseSetCookies.map(getCookieName).filter(Boolean)),
      ];

      console.info("[proxy] refresh exchange", {
        status: upstreamResponse.status,
        requestHasRefreshToken: (req.headers.get("cookie") ?? "").includes("refreshToken="),
        responseSetCookieCount: responseSetCookies.length,
        responseSetCookieNames: responseCookieNames,
        upstreamSetCookiePresent: Boolean(upstreamResponse.headers.get("set-cookie")),
        upstreamUrl,
        proxyKind: kind,
      });
    }

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: clientHeaders,
    });
  } catch (error) {
    console.error("[proxy] upstream request failed", {
      method: req.method,
      upstreamUrl,
      proxyKind: kind,
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

async function handle(req: NextRequest, ctx: RouteContext, kind: ProxyTargetKind) {
  const { path } = await ctx.params;
  return proxy(req, path, kind);
}

export function createProxyRouteHandlers(kind: ProxyTargetKind) {
  return {
    async GET(req: NextRequest, ctx: RouteContext) {
      return handle(req, ctx, kind);
    },
    async POST(req: NextRequest, ctx: RouteContext) {
      return handle(req, ctx, kind);
    },
    async PUT(req: NextRequest, ctx: RouteContext) {
      return handle(req, ctx, kind);
    },
    async PATCH(req: NextRequest, ctx: RouteContext) {
      return handle(req, ctx, kind);
    },
    async DELETE(req: NextRequest, ctx: RouteContext) {
      return handle(req, ctx, kind);
    },
    async HEAD(req: NextRequest, ctx: RouteContext) {
      return handle(req, ctx, kind);
    },
    async OPTIONS(req: NextRequest, ctx: RouteContext) {
      return handle(req, ctx, kind);
    },
  };
}
