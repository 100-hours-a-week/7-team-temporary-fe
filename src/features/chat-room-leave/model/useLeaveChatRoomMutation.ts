import { chatRoomQueryKeys } from "@/entities/chat-room";
import { Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";

import type { LeaveChatRoomFormModel } from "./types";

export function useLeaveChatRoomMutation() {
  return useApiMutation<LeaveChatRoomFormModel, void, void>({
    url: (form) => Endpoint.CHAT_ROOMS.LEAVE(form.roomId, form.participantId),
    method: "DELETE",
    authRequired: true,
    refreshOnUnauthorized: true,
    invalidateKeys: [chatRoomQueryKeys.listAll(), chatRoomQueryKeys.searchAll()],
  });
}
