const CONNECT_DESTINATION = process.env.NEXT_PUBLIC_CHAT_SOCKET_CONNECT_DEST?.trim();
const CONNECTED_DESTINATION = process.env.NEXT_PUBLIC_CHAT_SOCKET_CONNECTED_DEST?.trim();
const SUBSCRIBE_USER_DESTINATION = process.env.NEXT_PUBLIC_CHAT_SOCKET_SUBSCRIBE_USER_DEST?.trim();
const SUBSCRIBED_USER_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_SUBSCRIBED_USER_DEST?.trim();
const DISCONNECT_DESTINATION = process.env.NEXT_PUBLIC_CHAT_SOCKET_DISCONNECT_DEST?.trim();
const PONG_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_PONG_DEST?.trim() ?? "/pub/handshake/pong";
const SUBSCRIBE_ROOM_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_SUBSCRIBE_ROOM_DEST?.trim() ?? "/pub/room/subscribe";
const UNSUBSCRIBE_ROOM_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_UNSUBSCRIBE_ROOM_DEST?.trim() ?? "/pub/room/unsubscribe";
const MESSAGE_SEND_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_MESSAGE_SEND_DEST?.trim() ?? "/pub/room/message";
const USER_QUEUE_ROOM_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_USER_QUEUE_ROOM_DEST?.trim() ?? "/user/queue/room";
const RECONNECT_DELAY_MS = Number(process.env.NEXT_PUBLIC_CHAT_SOCKET_RECONNECT_DELAY_MS ?? 5000);
const CHAT_SOCKET_LOG_ENABLED =
  process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_CHAT_SOCKET_DEBUG === "true";

export interface ChatSocketStartConfig {
  brokerURL: string;
  connectDestination: string;
  connectedDestination: string;
  subscribeUserDestination: string;
  subscribedUserDestination: string;
  pongDestination: string;
  subscribeRoomDestination: string;
  unsubscribeRoomDestination: string;
  messageSendDestination: string;
  userQueueRoomDestination: string;
  reconnectDelayMs: number;
}

function resolveBrokerUrl() {
  return process.env.NEXT_PUBLIC_CHAT_STOMP_BROKER_URL?.trim();
}

export function isChatSocketLogEnabled() {
  return CHAT_SOCKET_LOG_ENABLED;
}

export function resolveChatSocketDisconnectDestination() {
  return DISCONNECT_DESTINATION;
}

export function resolveChatSocketStartConfig(): ChatSocketStartConfig | null {
  const brokerURL = resolveBrokerUrl();

  if (!brokerURL) {
    console.warn("[chat-socket] skip connect: NEXT_PUBLIC_CHAT_STOMP_BROKER_URL 미설정");
    return null;
  }

  if (!/^wss?:\/\//.test(brokerURL)) {
    console.warn("[chat-socket] skip connect: broker URL은 ws:// 또는 wss:// 형식 필요", {
      brokerURL,
    });
    return null;
  }

  if (
    !CONNECT_DESTINATION ||
    !CONNECTED_DESTINATION ||
    !SUBSCRIBE_USER_DESTINATION ||
    !SUBSCRIBED_USER_DESTINATION
  ) {
    console.warn("[chat-socket] skip connect: destination env 값이 누락되었습니다.");
    return null;
  }

  return {
    brokerURL,
    connectDestination: CONNECT_DESTINATION,
    connectedDestination: CONNECTED_DESTINATION,
    subscribeUserDestination: SUBSCRIBE_USER_DESTINATION,
    subscribedUserDestination: SUBSCRIBED_USER_DESTINATION,
    pongDestination: PONG_DESTINATION,
    subscribeRoomDestination: SUBSCRIBE_ROOM_DESTINATION,
    unsubscribeRoomDestination: UNSUBSCRIBE_ROOM_DESTINATION,
    messageSendDestination: MESSAGE_SEND_DESTINATION,
    userQueueRoomDestination: USER_QUEUE_ROOM_DESTINATION,
    reconnectDelayMs: Number.isFinite(RECONNECT_DELAY_MS) ? RECONNECT_DELAY_MS : 5000,
  };
}
