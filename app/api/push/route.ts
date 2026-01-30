import webpush, { type PushSubscription as WebPushSubscription } from "web-push";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type PushPayload = {
  title?: string;
  body?: string;
  icon?: string;
  url?: string;
};

type PushRequestBody = {
  subscription: WebPushSubscription;
  payload?: PushPayload;
};

export async function POST(request: Request) {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:dev@molip.today";

  if (!publicKey || !privateKey) {
    return NextResponse.json({ error: "Missing VAPID keys" }, { status: 500 });
  }

  let body: PushRequestBody;
  try {
    body = (await request.json()) as PushRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.subscription) {
    return NextResponse.json({ error: "Missing subscription" }, { status: 400 });
  }

  const payload: PushPayload = {
    title: body.payload?.title ?? "MOLIP",
    body: body.payload?.body ?? "푸시 알림 테스트",
    icon: body.payload?.icon ?? "/icons/icon.svg",
    url: body.payload?.url ?? "/",
  };

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    await webpush.sendNotification(body.subscription, JSON.stringify(payload));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[push] sendNotification failed", error);
    return NextResponse.json({ error: "Failed to send push" }, { status: 500 });
  }
}
