import { Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";

import { toCreateChatRoomRequestDto } from "./dto";
import type {
  CreateChatRoomFormModel,
  CreateChatRoomRequestDto,
  CreateChatRoomResponseDto,
} from "./types";

export function useCreateChatRoomMutation() {
  return useApiMutation<
    CreateChatRoomFormModel,
    CreateChatRoomRequestDto,
    CreateChatRoomResponseDto
  >({
    url: Endpoint.CHAT_ROOMS.CREATE,
    method: "POST",
    dtoFn: toCreateChatRoomRequestDto,
    authRequired: true,
    refreshOnUnauthorized: true,
    invalidateKeys: [["chat-room-search"]],
  });
}
