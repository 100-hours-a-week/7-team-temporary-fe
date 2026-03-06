import { chatRoomQueryKeys } from "@/entities/chat-room";
import { Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";

import { toJoinChatRoomRequestDto } from "./dto";
import type { JoinChatRoomFormModel, JoinChatRoomRequestDto } from "./types";

export function useJoinChatRoomMutation() {
  return useApiMutation<JoinChatRoomFormModel, JoinChatRoomRequestDto, void>({
    url: (form) => Endpoint.CHAT_ROOMS.JOIN(form.roomId),
    method: "POST",
    dtoFn: toJoinChatRoomRequestDto,
    authRequired: true,
    refreshOnUnauthorized: true,
    invalidateKeys: [chatRoomQueryKeys.searchAll(), chatRoomQueryKeys.listAll()],
  });
}
