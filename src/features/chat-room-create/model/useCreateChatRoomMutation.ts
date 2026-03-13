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
    url: (form) => {
      const searchParams = new URLSearchParams({ type: form.type });
      return `${Endpoint.CHAT_ROOMS.CREATE}?${searchParams.toString()}`;
    },
    method: "POST",
    dtoFn: toCreateChatRoomRequestDto,
    authRequired: true,
    refreshOnUnauthorized: true,
    invalidateKeys: [["chat-room-search"]],
  });
}
