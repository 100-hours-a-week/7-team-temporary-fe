"use client";

import { Client, type IFrame, type StompSubscription } from "@stomp/stompjs";

import { AuthService } from "@/shared/auth";
import {
  parseConnectedErrorCode,
  parseConnectedSuccessPayload,
  toStompHeaderErrorCode,
} from "./model/connectedMessage";
import type {
  DisconnectHandshakePayload,
  SubscribedUserEventPayload,
  SubscribeUserRequestPayload,
} from "./model/handshake.types";
import {
  resolveChatSocketDisconnectDestination,
  resolveChatSocketStartConfig,
} from "./model/socketEnv";
import { chatSocketLog, resolveStompDebugLogger } from "./model/socketLogger";
import { ensureBearerToken, resolveDeviceIdFromJwt } from "./model/token";

const DEFAULT_LOGOUT_DISCONNECT_PAYLOAD: DisconnectHandshakePayload = {
  code: "LOGOUT",
  message: "로그아웃으로 연결을 종료합니다.",
};

class ChatStompSession {
  private client: Client | null = null;
  private connectedSubscription: StompSubscription | null = null;
  private subscribedUserEventSubscription: StompSubscription | null = null;
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

    const startConfig = resolveChatSocketStartConfig();
    if (!startConfig) return;
    const {
      brokerURL,
      connectDestination,
      connectedDestination,
      subscribeUserDestination,
      subscribedUserDestination,
    } = startConfig;

    const bearerToken = ensureBearerToken(accessToken);
    const deviceId = resolveDeviceIdFromJwt(bearerToken);
    if (!deviceId) {
      console.warn("[chat-socket] skip connect: JWT payload에 deviceId가 없습니다.");
      return;
    }

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
      reconnectDelay: startConfig.reconnectDelayMs,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectHeaders: {
        accessToken: bearerToken,
        deviceId,
      },
      debug: resolveStompDebugLogger(),
    });

    client.onConnect = () => {
      // STOMP 자동 재연결 시 이전 구독 객체는 이미 닫힌 WebSocket에 묶여 있으므로
      // unsubscribe() 대신 참조만 초기화한다. STOMP 레이어가 세션 정리를 처리한다.
      this.connectedSubscription = null;
      this.subscribedUserEventSubscription = null;

      this.subscribedUserEventSubscription = client.subscribe(
        subscribedUserDestination,
        (message) => {
          try {
            const payload = JSON.parse(message.body) as Partial<SubscribedUserEventPayload>;
            if (typeof payload.userId !== "number" || typeof payload.subscribedAt !== "string") {
              console.warn("[chat-socket] subscribed.user payload 파싱 실패", {
                body: message.body,
                headers: message.headers,
              });
              return;
            }

            chatSocketLog("[chat-socket] subscribed.user", payload);
          } catch {
            console.warn("[chat-socket] subscribed.user payload 파싱 실패", {
              body: message.body,
              headers: message.headers,
            });
          }
        },
      );

      this.connectedSubscription = client.subscribe(connectedDestination, (message) => {
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

          const subscribeUserPayload: SubscribeUserRequestPayload = {
            requestedAt: new Date().toISOString(),
          };

          client.publish({
            destination: subscribeUserDestination,
            body: JSON.stringify(subscribeUserPayload),
          });

          chatSocketLog("[chat-socket] subscribe.user published", {
            destination: subscribeUserDestination,
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
        destination: connectDestination,
        body: JSON.stringify({ accessToken: bearerToken, deviceId }),
      });

      chatSocketLog("[chat-socket] socket.connect published", {
        destination: connectDestination,
        connectedDestination,
      });
    };

    client.onStompError = (frame: IFrame) => {
      const headerCode = toStompHeaderErrorCode(frame.headers["message"], frame.headers["code"]);

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
    const disconnectDestination = resolveChatSocketDisconnectDestination();
    chatSocketLog("[chat-socket] stop requested", {
      payload,
      hasClient: Boolean(client),
      isActive: client?.active ?? false,
      isConnected: client?.connected ?? false,
    });

    if (client?.connected && disconnectDestination) {
      const receiptId = `disconnect-${Date.now()}`;

      try {
        client.watchForReceipt(receiptId, () => {
          chatSocketLog("[chat-socket] socket.disconnect receipt received", {
            receiptId,
            destination: disconnectDestination,
          });
        });

        client.publish({
          destination: disconnectDestination,
          headers: { receipt: receiptId },
          body: JSON.stringify(payload),
        });

        chatSocketLog("[chat-socket] socket.disconnect published", {
          destination: disconnectDestination,
          payload,
          receiptId,
        });
      } catch (error) {
        console.error("[chat-socket] socket.disconnect publish failed", error);
      }
    }

    this.connectedSubscription?.unsubscribe();
    this.connectedSubscription = null;
    this.subscribedUserEventSubscription?.unsubscribe();
    this.subscribedUserEventSubscription = null;

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
