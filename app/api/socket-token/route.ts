import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * AT + XSRF-TOKEN 쿠키가 모두 존재하는지 확인한다.
 * XSRF-TOKEN이 없으면 401을 반환해 caller(AuthService)가 refresh()를 실행하도록 유도한다.
 * refresh(PUT /token) 응답이 XSRF-TOKEN을 세팅하며, 이후 _lib.ts의 clearing 필터가
 * GET 응답에 의한 XSRF-TOKEN 삭제를 차단하여 토큰이 유지된다.
 */
export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const xsrfToken = req.cookies.get("XSRF-TOKEN")?.value;
  if (!xsrfToken) {
    return NextResponse.json({ error: "xsrf_missing" }, { status: 401 });
  }

  const deviceId = req.cookies.get("deviceId")?.value ?? null;
  return NextResponse.json({ deviceId });
}
