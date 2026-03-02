import { Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";

import { toEditChatRoomRequestDto } from "./dto";
import type { EditChatRoomFormModel, EditChatRoomRequestDto } from "./types";

export function useEditChatRoomMutation(roomId: number) {
  return useApiMutation<EditChatRoomFormModel, EditChatRoomRequestDto, void>({
    url: Endpoint.CHAT_ROOMS.UPDATE(roomId),
    method: "PATCH",
    dtoFn: toEditChatRoomRequestDto,
    authRequired: true,
    refreshOnUnauthorized: true,
    invalidateKeys: [["chat-room-search"], ["chat-room"]],
  });
}
