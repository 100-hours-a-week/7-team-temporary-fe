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
const REPORT_MESSAGE_SEND_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_REPORT_MESSAGE_SEND_DEST?.trim() ?? "/pub/report/message";
const LAST_SEEN_UPDATE_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_LAST_SEEN_UPDATE_DEST?.trim() ?? "/pub/room/last-seen";
const USER_QUEUE_ROOM_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_USER_QUEUE_ROOM_DEST?.trim() ?? "/user/queue/room";
const USER_QUEUE_REPORT_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_USER_QUEUE_REPORT_DEST?.trim() ?? "/user/queue/report";
const CHAT_PARTICIPANT_ONLINE_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_CHAT_PARTICIPANT_ONLINE_DEST?.trim() ??
  "/pub/room/chat/online";
const CHAT_PARTICIPANT_HEARTBEAT_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_CHAT_PARTICIPANT_HEARTBEAT_DEST?.trim() ??
  "/pub/room/chat/heartbeat";
const CHAT_PARTICIPANT_OFFLINE_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_CHAT_PARTICIPANT_OFFLINE_DEST?.trim() ??
  "/pub/room/chat/offline";
const VIDEO_PARTICIPANT_ONLINE_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_VIDEO_PARTICIPANT_ONLINE_DEST?.trim() ??
  "/pub/room/video/online";
const VIDEO_PARTICIPANT_HEARTBEAT_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_VIDEO_PARTICIPANT_HEARTBEAT_DEST?.trim() ??
  "/pub/room/video/heartbeat";
const VIDEO_PARTICIPANT_OFFLINE_DESTINATION =
  process.env.NEXT_PUBLIC_CHAT_SOCKET_VIDEO_PARTICIPANT_OFFLINE_DEST?.trim() ??
  "/pub/room/video/offline";
const RECONNECT_DELAY_MS = Number(process.env.NEXT_PUBLIC_CHAT_SOCKET_RECONNECT_DELAY_MS ?? 5000);
const CHAT_SOCKET_LOG_ENABLED = true;

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
  reportMessageSendDestination: string;
  lastSeenUpdateDestination: string;
  userQueueRoomDestination: string;
  userQueueReportDestination: string;
  chatParticipantOnlineDestination: string;
  chatParticipantHeartbeatDestination: string;
  chatParticipantOfflineDestination: string;
  videoParticipantOnlineDestination: string;
  videoParticipantHeartbeatDestination: string;
  videoParticipantOfflineDestination: string;
  reconnectDelayMs: number;
}

function resolveBrokerUrl() {
  return process.env.NEXT_PUBLIC_CHAT_STOMP_BROKER_URL?.trim();
}

export function isChatSocketLogEnabled() {
  return CHAT_SOCKET_LOG_ENABLED;
}

function chatSocketEnvWarn(message: string, payload?: unknown) {
  if (!isChatSocketLogEnabled()) return;
  if (typeof payload === "undefined") {
    console.warn(message);
    return;
  }
  console.warn(message, payload);
}

export function resolveChatSocketDisconnectDestination() {
  return DISCONNECT_DESTINATION;
}

export function resolveChatSocketStartConfig(): ChatSocketStartConfig | null {
  const brokerURL = resolveBrokerUrl();

  if (!brokerURL) {
    chatSocketEnvWarn("[chat-socket] skip connect: NEXT_PUBLIC_CHAT_STOMP_BROKER_URL 미설정");
    return null;
  }

  if (!/^wss?:\/\//.test(brokerURL)) {
    chatSocketEnvWarn("[chat-socket] skip connect: broker URL은 ws:// 또는 wss:// 형식 필요", {
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
    chatSocketEnvWarn("[chat-socket] skip connect: destination env 값이 누락되었습니다.");
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
    reportMessageSendDestination: REPORT_MESSAGE_SEND_DESTINATION,
    lastSeenUpdateDestination: LAST_SEEN_UPDATE_DESTINATION,
    userQueueRoomDestination: USER_QUEUE_ROOM_DESTINATION,
    userQueueReportDestination: USER_QUEUE_REPORT_DESTINATION,
    chatParticipantOnlineDestination: CHAT_PARTICIPANT_ONLINE_DESTINATION,
    chatParticipantHeartbeatDestination: CHAT_PARTICIPANT_HEARTBEAT_DESTINATION,
    chatParticipantOfflineDestination: CHAT_PARTICIPANT_OFFLINE_DESTINATION,
    videoParticipantOnlineDestination: VIDEO_PARTICIPANT_ONLINE_DESTINATION,
    videoParticipantHeartbeatDestination: VIDEO_PARTICIPANT_HEARTBEAT_DESTINATION,
    videoParticipantOfflineDestination: VIDEO_PARTICIPANT_OFFLINE_DESTINATION,
    reconnectDelayMs: Number.isFinite(RECONNECT_DELAY_MS) ? RECONNECT_DELAY_MS : 5000,
  };
}
