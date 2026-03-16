const toHex = (value: number) => value.toString(16).padStart(2, "0");

function createUuidFromBytes(bytes: Uint8Array): string {
  const hex = Array.from(bytes, toHex);

  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

/**
 * 브라우저 환경에서 안정적으로 사용할 수 있는 ID 생성기.
 * - crypto.randomUUID 지원 시 우선 사용
 * - 미지원 환경은 getRandomValues(UUID v4 포맷)로 대체
 * - 최후 fallback은 시간/난수 기반 문자열 사용
 */
export function createClientId(): string {
  const cryptoApi = globalThis.crypto;

  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  if (typeof cryptoApi?.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);

    // RFC 4122 UUID v4 bit settings
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    return createUuidFromBytes(bytes);
  }

  return `fallback-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}
