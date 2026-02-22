import type { FriendItemResponseDto, FriendListResponseDto } from "../api";

import type { FriendListItemVM, FriendListModel } from "./types";

const DEFAULT_NICKNAME = "이름 미설정";
const DEFAULT_EMAIL = "이메일 정보 없음";

function toFriendListItemVM(item: FriendItemResponseDto): FriendListItemVM {
  return {
    id: item.friendUserId,
    nickname: item.friendNickname?.trim() || DEFAULT_NICKNAME,
    email: item.friendEmail?.trim() || DEFAULT_EMAIL,
    profileImageUrl: item.profileImage?.url?.trim() || null,
  };
}

export function toFriendListModel(dto: FriendListResponseDto): FriendListModel {
  return {
    content: dto.content.map(toFriendListItemVM),
    page: dto.page,
    size: dto.size,
    totalElements: dto.totalElements,
    totalPages: dto.totalPages,
  };
}
