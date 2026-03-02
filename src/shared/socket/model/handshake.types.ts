export interface DisconnectHandshakePayload {
  code: string;
  message: string;
}

export interface SocketConnectedSuccessPayload {
  sessionId: string;
  userId: number;
  connectedAt: string;
  serverTime: string;
}

export interface SubscribeUserRequestPayload {
  requestedAt: string;
}

export interface SubscribedUserEventPayload {
  userId: number;
  subscribedAt: string;
}
