import { Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";

export function useDeleteChatRoomMutation(roomId: number) {
  return useApiMutation<void, void, void>({
    url: Endpoint.CHAT_ROOMS.DELETE(roomId),
    method: "DELETE",
    authRequired: true,
    refreshOnUnauthorized: true,
    invalidateKeys: [["chat-room-search"], ["chat-room"]],
  });
}
