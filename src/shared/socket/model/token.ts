export function ensureBearerToken(token: string) {
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

function toRawAccessToken(token: string) {
  return token.startsWith("Bearer ") ? token.slice(7) : token;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const rawToken = toRawAccessToken(token);
  const segments = rawToken.split(".");
  if (segments.length < 2) return null;

  try {
    const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(`${base64}${padding}`);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function resolveDeviceIdFromJwt(token: string): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return typeof payload.deviceId === "string" ? payload.deviceId : null;
}
