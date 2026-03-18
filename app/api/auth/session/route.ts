import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * AT HttpOnly 쿠키 유효성을 확인하고, 소켓 핸드셰이크에 필요한 deviceId를 반환한다.
 * 클라이언트가 HttpOnly 쿠키를 직접 읽을 수 없어서 인증 부트스트랩 단계에서 사용된다.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const deviceId = req.cookies.get("deviceId")?.value ?? null;
  return NextResponse.json({ deviceId });
}
