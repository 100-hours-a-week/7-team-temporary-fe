import { apiFetch, Endpoint } from "@/shared/api";
import { AuthService } from "@/shared/auth";
import { requestFcmToken } from "./requestFcmToken";

type RegisterFcmTokenOptions = {
  promptPermission?: boolean;
};

export async function registerFcmToken(
  options: RegisterFcmTokenOptions = {},
): Promise<string | null> {
  const token = await requestFcmToken({
    promptPermission: options.promptPermission ?? true,
  });

  if (!token) return null;

  await AuthService.refreshAndRetry(() =>
    apiFetch<void, { fcmToken: string; platform: "WEB" }>(Endpoint.FCM.TOKENS, {
      method: "POST",
      body: { fcmToken: token, platform: "WEB" },
      authRequired: true,
    }),
  );

  return token;
}
