import type { ChatRoomListItemVM } from "@/entities/chat-room";

/**
 * REST 재조회 결과가 이미 실시간 patch 내용을 반영했는지 확인한다.
 * 반영됐으면 patch를 제거해 중복 적용을 방지한다.
 */
export function isPatchResolvedByServer(
  room: ChatRoomListItemVM,
  patch: Partial<ChatRoomListItemVM>,
): boolean {
  const unreadSynced =
    patch.unreadCount === undefined ||
    room.unreadCount === patch.unreadCount ||
    room.unreadCount === 0;
  const participantsSynced =
    patch.participantsCount === undefined || room.participantsCount === patch.participantsCount;
  const lastMessageSynced =
    patch.lastMessage === undefined || room.lastMessage === patch.lastMessage;
  const lastMessageAtSynced =
    patch.lastMessageAt === undefined || room.lastMessageAt === patch.lastMessageAt;

  if (unreadSynced && participantsSynced && lastMessageSynced && lastMessageAtSynced) {
    return true;
  }

  if (
    typeof patch.lastMessageAt === "string" &&
    typeof room.lastMessageAt === "string" &&
    Number.isFinite(Date.parse(patch.lastMessageAt)) &&
    Number.isFinite(Date.parse(room.lastMessageAt))
  ) {
    return Date.parse(room.lastMessageAt) >= Date.parse(patch.lastMessageAt);
  }

  return false;
}
