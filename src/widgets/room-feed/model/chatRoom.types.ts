/** WebSocket으로 수신하는 방별 실시간 상태 (향후 연결) */
export interface ChatRoomRealtimeState {
  roomId: number;
  lastMessage: string;
  lastMessageAt: string; // ISO date string
  unreadCount: number;
}
