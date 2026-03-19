import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * AT + XSRF-TOKEN 쿠키가 모두 존재하고 AT가 만료되지 않았는지 확인한다.
 * AT가 없거나 만료됐으면 401을 반환해 caller(AuthService)가 refresh()를 실행하도록 유도한다.
 * XSRF-TOKEN이 없으면 401을 반환해 refresh()가 새 토큰을 세팅하도록 유도한다.
 */

function isAccessTokenExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf-8")) as {
      exp?: number;
    };
    if (typeof decoded.exp !== "number") return true;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (isAccessTokenExpired(accessToken)) {
    return NextResponse.json({ error: "token_expired" }, { status: 401 });
  }

  const xsrfToken = req.cookies.get("XSRF-TOKEN")?.value;
  if (!xsrfToken) {
    return NextResponse.json({ error: "xsrf_missing" }, { status: 401 });
  }

  const deviceId = req.cookies.get("deviceId")?.value ?? null;
  return NextResponse.json({ deviceId });
}
