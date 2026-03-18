import { registerFcmTokenAction } from "./fcmServerActions";
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

  await registerFcmTokenAction(token);

  return token;
}
