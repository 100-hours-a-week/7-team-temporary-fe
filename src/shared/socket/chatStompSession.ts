"use client";

import { Client, type IFrame, type IMessage, type StompSubscription } from "@stomp/stompjs";

import { AuthService } from "@/shared/auth";
import { getOrCreateDeviceId } from "@/shared/device";

const CONNECT_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_CONNECT_DEST?.trim() || "/pub/socket.connect";
const CONNECTED_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_CONNECTED_DEST?.trim() || "/user/queue/socket.connected";
const SUBSCRIBE_USER_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_SUBSCRIBE_USER_DEST?.trim() || "/pub/socket.subscribe.user";
const DISCONNECT_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_DISCONNECT_DEST?.trim() || "/pub/socket.disconnect";
const RECONNECT_DELAY_MS = Number(process.env.NEXT_PUBLIC_CHAT_SOCKET_RECONNECT_DELAY_MS ?? 5000);
const CHAT_SOCKET_LOG_ENABLED =
  process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_CHAT_SOCKET_DEBUG === "true";

/*
 * 소켓 디버그 로그 출력 유틸.
 * 개발 모드 또는 디버그 플래그가 켜진 경우에만 콘솔에 출력한다.
 */
function chatSocketLog(message: string, payload?: unknown) {
  if (!CHAT_SOCKET_LOG_ENABLED) return;
  if (typeof payload === "undefined") {
    console.log(message);
    return;
  }
  console.log(message, payload);
}

const SOCKET_CONNECTED_ERROR_CODES = [
  "CONNECT_UNAUTHORIZED",
  "CONNECT_TOKEN_EXPIRED",
  "CONNECT_INVALID_PAYLOAD",
] as const;

type SocketConnectedErrorCode = (typeof SOCKET_CONNECTED_ERROR_CODES)[number];

interface DisconnectHandshakePayload {
  code: string;
  message: string;
}

interface SocketConnectedSuccessPayload {
  sessionId: string;
  userId: number;
  connectedAt: string;
  serverTime: string;
}

interface SubscribeUserHandshakePayload {
  sessionId: string;
  userId: number;
  deviceId: string;
  subscribedAt: string;
}

const DEFAULT_LOGOUT_DISCONNECT_PAYLOAD: DisconnectHandshakePayload = {
  code: "LOGOUT",
  message: "로그아웃으로 연결을 종료합니다.",
};

/*
 * STOMP broker URL 환경변수를 읽는다.
 * undefined 또는 빈 값이면 연결 시도를 스킵한다.
 */
function resolveBrokerUrl() {
  return process.env.NEXT_PUBLIC_CHAT_STOMP_BROKER_URL?.trim();
}

/*
 * 토큰 문자열을 Bearer 형식으로 표준화한다.
 * 이미 Bearer prefix가 있으면 그대로 사용한다.
 */
function ensureBearerToken(token: string) {
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

/*
 * 서버가 보낸 문자열을 클라이언트가 아는 연결 에러 코드로 변환한다.
 * 목록에 없는 값은 null로 처리한다.
 */
function toSocketConnectedErrorCode(
  value: string | null | undefined,
): SocketConnectedErrorCode | null {
  if (!value) return null;
  return SOCKET_CONNECTED_ERROR_CODES.includes(value as SocketConnectedErrorCode)
    ? (value as SocketConnectedErrorCode)
    : null;
}

/*
 * socket.connected 메시지에서 에러 코드를 추출한다.
 * plain text, JSON(code/status/data) 포맷을 모두 지원한다.
 */
function parseConnectedErrorCode(message: IMessage): SocketConnectedErrorCode | null {
  const direct = toSocketConnectedErrorCode(message.body?.trim());
  if (direct) return direct;

  try {
    const parsed = JSON.parse(message.body) as { code?: string; status?: string; data?: string };
    return (
      toSocketConnectedErrorCode(parsed.code) ??
      toSocketConnectedErrorCode(parsed.status) ??
      toSocketConnectedErrorCode(parsed.data)
    );
  } catch {
    return null;
  }
}

/*
 * socket.connected 성공 payload를 파싱하고 타입을 검증한다.
 * 필수 필드가 하나라도 없으면 null을 반환한다.
 */
function parseConnectedSuccessPayload(message: IMessage): SocketConnectedSuccessPayload | null {
  try {
    const parsed = JSON.parse(message.body) as Partial<SocketConnectedSuccessPayload>;
    if (
      typeof parsed.sessionId === "string" &&
      typeof parsed.userId === "number" &&
      typeof parsed.connectedAt === "string" &&
      typeof parsed.serverTime === "string"
    ) {
      return {
        sessionId: parsed.sessionId,
        userId: parsed.userId,
        connectedAt: parsed.connectedAt,
        serverTime: parsed.serverTime,
      };
    }
    return null;
  } catch {
    return null;
  }
}

class ChatStompSession {
  private client: Client | null = null;
  private connectedSubscription: StompSubscription | null = null;
  private lastBearerToken: string | null = null;
  private isRefreshing = false;

  /*
   * 소켓 연결 시작 엔트리 포인트.
   * - 환경값/URL/토큰 유효성 점검
   * - 동일 토큰 중복 start 방지
   * - CONNECT -> CONNECTED -> SUBSCRIBE_USER 핸드셰이크 수행
   */
  start(accessToken: string) {
    if (typeof window === "undefined") return;

    const brokerURL = resolveBrokerUrl();

    if (!brokerURL) {
      // 항상 출력해야 하는 설정 누락 경고
      console.warn("[chat-socket] skip connect: NEXT_PUBLIC_CHAT_STOMP_BROKER_URL 미설정");
      return;
    }
    if (!/^wss?:\/\//.test(brokerURL)) {
      console.warn("[chat-socket] skip connect: broker URL은 ws:// 또는 wss:// 형식 필요", {
        brokerURL,
      });
      return;
    }

    const bearerToken = ensureBearerToken(accessToken);
    const deviceId = getOrCreateDeviceId();

    chatSocketLog("[chat-socket] start requested", {
      hasAccessToken: Boolean(accessToken),
      brokerURL,
      isActive: this.client?.active ?? false,
    });

    if (this.client && this.lastBearerToken === bearerToken) {
      chatSocketLog("[chat-socket] start skipped: existing client with same token", {
        isActive: this.client.active,
        isConnected: this.client.connected,
      });
      return;
    }

    if (this.client) {
      chatSocketLog("[chat-socket] start requested with changed token: reconnecting");
      this.stop({
        code: "RECONNECT",
        message: "재연결을 위해 기존 소켓 연결을 종료합니다.",
      });
    }

    const client = new Client({
      brokerURL,
      reconnectDelay: Number.isFinite(RECONNECT_DELAY_MS) ? RECONNECT_DELAY_MS : 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectHeaders: {
        accessToken: bearerToken,
        deviceId,
      },
      debug: CHAT_SOCKET_LOG_ENABLED ? (msg) => console.log("[chat-socket:stomp]", msg) : undefined,
    });

    client.onConnect = () => {
      // STOMP 자동 재연결 시 이전 구독 객체는 이미 닫힌 WebSocket에 묶여 있으므로
      // unsubscribe() 대신 참조만 초기화한다. STOMP 레이어가 세션 정리를 처리한다.
      this.connectedSubscription = null;
      this.connectedSubscription = client.subscribe(CONNECTED_DESTINATION, (message) => {
        const code = parseConnectedErrorCode(message);
        if (!code) {
          const connectedPayload = parseConnectedSuccessPayload(message);
          if (!connectedPayload) {
            console.warn("[chat-socket] socket.connected payload 파싱 실패", {
              body: message.body,
              headers: message.headers,
            });
            return;
          }

          chatSocketLog("[chat-socket] socket.connected", connectedPayload);

          const subscribeUserPayload: SubscribeUserHandshakePayload = {
            sessionId: connectedPayload.sessionId,
            userId: connectedPayload.userId,
            deviceId,
            subscribedAt: new Date().toISOString(),
          };

          client.publish({
            destination: SUBSCRIBE_USER_DESTINATION,
            body: JSON.stringify(subscribeUserPayload),
          });

          chatSocketLog("[chat-socket] subscribe.user published", {
            destination: SUBSCRIBE_USER_DESTINATION,
            payload: subscribeUserPayload,
          });
          return;
        }

        console.warn("[chat-socket] socket.connected error", { code, body: message.body });

        if (code === "CONNECT_TOKEN_EXPIRED") {
          void this.refreshAndReconnect();
          return;
        }

        this.stop({
          code,
          message: `서버 응답 코드(${code})로 연결을 종료합니다.`,
        });
      });

      client.publish({
        destination: CONNECT_DESTINATION,
        body: JSON.stringify({ accessToken: bearerToken, deviceId }),
      });

      chatSocketLog("[chat-socket] socket.connect published", {
        destination: CONNECT_DESTINATION,
        connectedDestination: CONNECTED_DESTINATION,
      });
    };

    client.onStompError = (frame: IFrame) => {
      const headerCode =
        toSocketConnectedErrorCode(frame.headers["message"]) ??
        toSocketConnectedErrorCode(frame.headers["code"]);

      console.warn("[chat-socket] STOMP error", {
        command: frame.command,
        headers: frame.headers,
        body: frame.body,
      });

      if (headerCode === "CONNECT_TOKEN_EXPIRED") {
        void this.refreshAndReconnect();
      }
    };

    client.onWebSocketError = (error) => {
      console.error("[chat-socket] WebSocket error", error);
    };

    client.onWebSocketClose = (event) => {
      chatSocketLog("[chat-socket] WebSocket closed", {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
    };

    client.activate();
    chatSocketLog("[chat-socket] client.activate called");
    this.client = client;
    this.lastBearerToken = bearerToken;
  }

  /*
   * 소켓 연결 종료 엔트리 포인트.
   * 연결된 상태면 socket.disconnect를 서버에 전송하고, 구독/클라이언트 상태를 정리한다.
   */
  stop(payload: DisconnectHandshakePayload = DEFAULT_LOGOUT_DISCONNECT_PAYLOAD) {
    const client = this.client;
    chatSocketLog("[chat-socket] stop requested", {
      payload,
      hasClient: Boolean(client),
      isActive: client?.active ?? false,
      isConnected: client?.connected ?? false,
    });

    if (client?.connected) {
      const receiptId = `disconnect-${Date.now()}`;

      try {
        client.watchForReceipt(receiptId, () => {
          chatSocketLog("[chat-socket] socket.disconnect receipt received", {
            receiptId,
            destination: DISCONNECT_DESTINATION,
          });
        });

        client.publish({
          destination: DISCONNECT_DESTINATION,
          headers: { receipt: receiptId },
          body: JSON.stringify(payload),
        });

        chatSocketLog("[chat-socket] socket.disconnect published", {
          destination: DISCONNECT_DESTINATION,
          payload,
          receiptId,
        });
      } catch (error) {
        console.error("[chat-socket] socket.disconnect publish failed", error);
      }
    }

    this.connectedSubscription?.unsubscribe();
    this.connectedSubscription = null;

    if (client) {
      client.deactivate();
    }

    this.client = null;
    this.lastBearerToken = null;
    this.isRefreshing = false;
  }

  /*
   * 토큰 만료 응답 시 1회만 refresh를 시도하고 재연결한다.
   * refresh 실패 시 세션을 종료한다.
   */
  private async refreshAndReconnect() {
    if (this.isRefreshing) return;
    this.isRefreshing = true;

    try {
      const nextToken = await AuthService.refresh();
      this.start(nextToken);
    } catch (error) {
      console.warn("[chat-socket] refresh and reconnect failed", error);
      this.stop({
        code: "TOKEN_EXPIRED",
        message: "토큰 갱신 실패로 연결을 종료합니다.",
      });
    } finally {
      this.isRefreshing = false;
    }
  }
}

export const chatStompSession = new ChatStompSession();
