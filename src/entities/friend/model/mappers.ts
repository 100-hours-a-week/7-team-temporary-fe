import type {
  FriendItemResponseDto,
  FriendListResponseDto,
  FriendRequestItemResponseDto,
  FriendRequestListResponseDto,
  FriendSearchItemResponseDto,
  FriendSearchResponseDto,
} from "../api";

import type {
  FriendListItemVM,
  FriendListModel,
  FriendRequestItemVM,
  FriendRequestListModel,
} from "./types";

const DEFAULT_NICKNAME = "이름 미설정";
const DEFAULT_EMAIL = "이메일 정보 없음";

function toFriendListItemVM(item: FriendItemResponseDto): FriendListItemVM {
  return {
    id: item.friendUserId,
    nickname: item.friendNickname?.trim() || DEFAULT_NICKNAME,
    email: item.friendEmail?.trim() || DEFAULT_EMAIL,
    profileImageUrl: item.profileImage?.url?.trim() || null,
    isFriend: true,
  };
}

function toFriendSearchListItemVM(item: FriendSearchItemResponseDto): FriendListItemVM {
  return {
    id: item.userId,
    nickname: item.nickname?.trim() || DEFAULT_NICKNAME,
    email: item.email?.trim() || DEFAULT_EMAIL,
    profileImageUrl: item.profileImage?.url?.trim() || null,
    isFriend: Boolean(item.isFriend),
  };
}

function toFriendRequestItemVM(item: FriendRequestItemResponseDto): FriendRequestItemVM {
  return {
    requestId: item.requestId,
    id: item.fromUserId,
    nickname: item.fromUserNickname?.trim() || DEFAULT_NICKNAME,
    email: item.fromUserEmail?.trim() || DEFAULT_EMAIL,
    profileImageUrl: item.profileImage?.url?.trim() || null,
    isFriend: false,
    requestedAt: item.createdAt ?? "",
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

export function toFriendSearchModel(dto: FriendSearchResponseDto): FriendListModel {
  const content = dto.content
    .map(toFriendSearchListItemVM)
    .sort((a, b) => a.nickname.localeCompare(b.nickname, "ko"));

  return {
    content,
    page: dto.page,
    size: dto.size,
    totalElements: dto.totalElements,
    totalPages: dto.totalPages,
  };
}

export function toFriendRequestListModel(
  dto: FriendRequestListResponseDto,
): FriendRequestListModel {
  const content = dto.content
    .map(toFriendRequestItemVM)
    .sort(
      (a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime(),
    );

  return {
    content,
    page: dto.page,
    size: dto.size,
    totalElements: dto.totalElements,
    totalPages: dto.totalPages,
  };
}
