import { chatRoomQueryKeys } from "@/entities/chat-room";
import { Endpoint } from "@/shared/api";
import { useApiMutation } from "@/shared/query";

interface EnterFriendChatRoomFormModel {
  friendId: number;
}

interface EnterFriendChatRoomResponseDto {
  roomId: number;
  action: string;
}

export function useEnterFriendChatRoomMutation() {
  return useApiMutation<EnterFriendChatRoomFormModel, void, EnterFriendChatRoomResponseDto>({
    url: (form) => Endpoint.CHAT_ROOMS.JOIN_BY_FRIEND(form.friendId),
    method: "POST",
    authRequired: true,
    refreshOnUnauthorized: true,
    invalidateKeys: [chatRoomQueryKeys.listAll(), chatRoomQueryKeys.searchAll()],
  });
}
